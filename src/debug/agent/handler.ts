import { ContextAgent } from "greyhack-message-hook-client";
import vscode, { SourceBreakpoint, Uri } from 'vscode';
import { findExistingPath, tryToDecode } from "../../helper/fs";
import PseudoTerminal from "../pseudo-terminal";
import EventEmitter from "events";
import { OutputHandler } from "./output";
import { DebugSessionLike } from "../types";
import { BreakpointEvent, StoppedEvent } from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";
import { randomString } from "../../helper/random-string";
import { VersionManager } from "../../helper/version-manager";

enum ClientMessageType {
  SendFileSizeClientRpc = 73,
  DecipherTimeClientRpc = 75,
  ClearScreenClientRpc = 77,
  InputSentClientRpc = 78,
  PrintSentClientRpc = 79,
  CreatedContextRpc = 1000,
  FinishedContextRpc = 1002,
  ContextRuntimeStateRpc = 1003,
  ContextLoadFileRpc = 1004,
  ContextBreakpointRpc = 1005,
  ContextOpenInternalFileRpc = 1009,
  ContextUnexpectedErrorRpc = 1010,
  DisposedContextRpc = 1020,
  StatusRpc = 1200,
  InvalidAction = 1300,
}

interface StackItem {
  filepath: string;
  lineNum: number;
  name: string;
  isExternal: boolean;
}

interface ContextBreakpoint {
  contextID: string;
  filepath: string;
  source: string;
  line: number;
  variables: Record<string, string>;
  stacktrace: StackItem[];
}

async function resolveFileExtension(path: string): Promise<Uri | null> {
  return await findExistingPath(
    Uri.file(path),
    Uri.file(`${path}.src`),
    Uri.file(`${path}.gs`),
    Uri.file(`${path}.ms`)
  );
}

export class SessionHandler extends EventEmitter {
  static previousTerminal: PseudoTerminal | null;

  session: DebugSessionLike;
  private _agent: ContextAgent;
  private _running: boolean = false;
  private _lastPath: Uri = null;
  private _basePath: Uri = null;
  private _instance: any = null;
  private _lastBreakpoint: ContextBreakpoint;
  private _internalFileMap: Record<string, string>;
  private _temporaryPath: string;

  private _outputHandler: OutputHandler;

  constructor(session: DebugSessionLike, port: number, hideUnsupportedTags: boolean) {
    super();
    this.session = session;
    this._agent = new ContextAgent({
      warn: () => { },
      error: () => { },
      info: () => { },
      debug: () => { }
    }, port);
    this._outputHandler = new OutputHandler(this, hideUnsupportedTags);
    this._internalFileMap = {};
    this._temporaryPath = "temp-" + randomString(10);
  }

  get outputHandler() {
    return this._outputHandler;
  }

  async start(programName: string, path: Uri, params: string[], debugMode: boolean, environmentVariables: Record<string, string>) {
    const healthcheck = await VersionManager.performHealthCheck(this._agent);

    if (!healthcheck.isSingleplayer) {
      throw new Error('Can only start in-game debug session with singleplayer running!');
    }

    const content = await tryToDecode(path);
    const breakpoints = vscode.debug.breakpoints.filter((bp: SourceBreakpoint) => {
      return bp.enabled;
    }).map((bp: SourceBreakpoint) => {
      return {
        filepath: bp.location.uri.fsPath,
        lineNum: bp.location.range.start.line + 1,
      };
    });

    this._lastPath = path;
    this._basePath = vscode.workspace.getWorkspaceFolder(this._lastPath)?.uri ?? Uri.file(process.cwd());
    
    const { value } = await this._agent.createContext(
      `params=[${params.map((it) => `"${it.replace(/"/g, '""')}"`).join(',')}];` + content,
      this._lastPath.fsPath,
      this._basePath.fsPath,
      programName,
      debugMode,
      breakpoints,
      environmentVariables
    );
    this._running = true;
    this._instance = value;
    this.registerMessageHandler();
  }

  private async verifyFilepath(path: string) {
    if (this._internalFileMap[path]) {
      const resolvedPath = Uri.joinPath(this._basePath, this._temporaryPath, `${path}.src`);
      const content = this._internalFileMap[path];

      await vscode.workspace.fs.writeFile(resolvedPath, Buffer.from(content));

      return {
        resolvedPath: resolvedPath.fsPath,
        originalPath: path,
      };
    }

    const resolvedPath = await resolveFileExtension(path);

    return {
      resolvedPath: resolvedPath ? resolvedPath.fsPath : path,
      originalPath: path,
    };
  }

  private async createFilepathMap(paths: string[]) {
    const resolvedPaths = await Promise.all(paths.map(async (it) => this.verifyFilepath(it)));

    return resolvedPaths.reduce((result, { resolvedPath, originalPath }) => {
      result[originalPath] = resolvedPath;
      return result;
    }, {});
  }

  private async parseContextBreakpoint(contextBreakpoint: any): Promise<ContextBreakpoint> {
    const mappedPaths = await this.createFilepathMap([
      contextBreakpoint.filepath,
      ...contextBreakpoint.stacktrace.map((it) => it.filepath)
    ]);
  
    return {
      contextID: contextBreakpoint.contextID,
      filepath: mappedPaths[contextBreakpoint.filepath],
      source: contextBreakpoint.source,
      line: contextBreakpoint.line,
      variables: contextBreakpoint.variables,
      stacktrace: contextBreakpoint.stacktrace.map((it) => {
        return {
          filepath: mappedPaths[it.filepath],
          lineNum: it.lineNum,
          name: it.name,
          isExternal: it.isExternal,
        };
      })
    };
  }

  private registerMessageHandler() {
    this._instance.on('receive', async (id, response) => {
      switch (id) {
        case ClientMessageType.FinishedContextRpc: {
          this.stop();
          break;
        }
        case ClientMessageType.ContextBreakpointRpc: {
          this._lastBreakpoint = await this.parseContextBreakpoint(response);

          const actualBreakpoint: DebugProtocol.Breakpoint = {
            verified: true,
            source: {
              path: this._lastBreakpoint.filepath,
            },
            line: this._lastBreakpoint.line
          };
          this.session.sendEvent(new BreakpointEvent('changed', actualBreakpoint));
          this.session.sendEvent(
            new StoppedEvent('breakpoint', this.session.threadID)
          );
          break;
        }
        case ClientMessageType.DecipherTimeClientRpc: {
          await this.endDecipher();
          break;
        }
        case ClientMessageType.SendFileSizeClientRpc: {
          this._outputHandler.print('Transfer...');
          await this.endDownload();
          break;
        }
        case ClientMessageType.ContextLoadFileRpc: {
          await this.resolveFile(response.filepath);
          break;
        }
        case ClientMessageType.ContextOpenInternalFileRpc: {
          this._internalFileMap[response.filepath] = response.source
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
          break;
        }
        case ClientMessageType.PrintSentClientRpc: {
          this._outputHandler.print(response.output, response.replaceText);
          break;
        }
        case ClientMessageType.ClearScreenClientRpc: {
          this._outputHandler.clear();
          break;
        }
        case ClientMessageType.InputSentClientRpc: {
          if (response.anyKey) {
            const key = await this._outputHandler.waitForKeyPress(response.output);
            this._instance.sendInput(key.code);
            break;
          }

          const input = await this._outputHandler.waitForInput(response.isPassword, response.output);
          this._instance.sendInput(input);
          break;
        }
        case ClientMessageType.ContextUnexpectedErrorRpc: {
          await this.stop();
          break;
        }
      }
    });
  }

  async waitForFinished() {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!this._running) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  }

  async setDebugMode(debugMode: boolean) {
    if (this._instance == null) return;
    await this._instance.setDebugMode(debugMode);
  }

  async endDecipher() {
    if (this._instance == null) return;
    await this._instance.endDecipher();
  }

  async endDownload() {
    if (this._instance == null) return;
    await this._instance.endDownload();
  }

  async goToNextLine() {
    if (this._instance == null) return;
    await this._instance.goToNextLine();
  }

  async injectCode(context: string) {
    if (this._instance == null) return;
    await this._instance.injectCode(context);
  }

  private async resolveFile(path: string) {
    if (this._instance == null) return;
    const resolvedPath = await resolveFileExtension(path);
    if (resolvedPath == null) {
      await this._instance.resolvedFile(path, null);
      return;
    }
    const content = await tryToDecode(resolvedPath);
    await this._instance.resolvedFile(resolvedPath.fsPath, content);
  }

  async stop() {
    if (this._instance) {
      const agent = this._agent;
      const instance = this._instance;
      const tempFolderUri = Uri.joinPath(this._basePath, this._temporaryPath);

      this._instance = null;
      this._lastBreakpoint = null;
      this._agent = null;
      await instance.dispose().catch(console.warn);
      agent.dispose().catch(console.warn);
      try {
        await vscode.workspace.fs.delete(tempFolderUri, {
          recursive: true,
          useTrash: false,
        });
        await vscode.workspace.fs.delete(tempFolderUri);
      } catch (err) {
        console.warn(`Failed to delete temporary folder: ${tempFolderUri.fsPath}`, err);
      }
      this._running = false;
      this.emit('exit');
    }
  }

  getLastBreakpoint() {
    return this._lastBreakpoint;
  }
}