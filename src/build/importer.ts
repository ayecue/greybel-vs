import GreybelAgentPkg from 'greybel-agent';
import { TranspilerParseResult } from 'greybel-transpiler';
import path from 'path';
import vscode, { ExtensionContext } from 'vscode';

import { createBasePath } from '../helper/create-base-path';
import { generateAutoCompileCode } from './auto-compile-helper';
import { wait } from '../helper/wait';
const { GreybelC2Agent, GreybelC2LightAgent } = GreybelAgentPkg;

export enum ErrorResponseMessage {
  OutOfRam = 'I can not open the program. There is not enough RAM available. Close some program and try again.',
  DesktopUI = 'Error: Desktop GUI is not running.',
  CanOnlyRunOnComputer = 'Error: this program can only be run on computers.',
  CannotBeExecutedRemotely = 'Error: this program can not be executed remotely',
  CannotLaunch = "Can't launch program. Permission denied.",
  NotAttached = 'Error: script is not attached to any existing terminal',
  DeviceNotFound = 'Error: device not found.',
  NoInternet = 'Error: No internet connection',
  InvalidCommand = 'Unknown error: invalid command.'
}

export enum AgentType {
  C2 = 'headless',
  C2Light = 'message-hook'
}

export enum ImporterMode {
  Local = 'local',
  Public = 'public'
}

const IMPORTER_MODE_MAP = {
  [ImporterMode.Local]: 2,
  [ImporterMode.Public]: 0
};

type ImportItem = {
  ingameFilepath: string;
  content: string;
};

export type ImportResultSuccess = {
  path: string;
  success: true;
};

export type ImportResultFailure = {
  path: string;
  success: false;
  reason: string;
};

export type ImportResult = ImportResultSuccess | ImportResultFailure;

export interface ImporterOptions {
  target: string;
  mode: ImporterMode;
  ingameDirectory: string;
  agentType: AgentType;
  result: TranspilerParseResult;
  extensionContext: ExtensionContext;
  autoCompile: boolean;
  postCommand: string;
}

class Importer {
  private importRefs: Map<string, ImportItem>;
  private agentType: AgentType;
  private target: string;
  private ingameDirectory: string;
  private mode: ImporterMode;
  private extensionContext: ExtensionContext;
  private autoCompile: boolean;
  private postCommand: string;

  constructor(options: ImporterOptions) {
    this.target = options.target;
    this.ingameDirectory = options.ingameDirectory.trim().replace(/\/$/i, '');
    this.importRefs = this.createImportList(options.target, options.result);
    this.agentType = options.agentType;
    this.mode = options.mode;
    this.extensionContext = options.extensionContext;
    this.autoCompile = options.autoCompile;
    this.postCommand = options.postCommand;
  }

  private createImportList(
    rootTarget: string,
    parseResult: TranspilerParseResult
  ): Map<string, ImportItem> {
    return Object.entries(parseResult).reduce<Map<string, ImportItem>>(
      (result, [target, code]) => {
        const ingameFilepath = createBasePath(rootTarget, target, '');

        result.set(target, {
          ingameFilepath,
          content: code
        });

        return result;
      },
      new Map()
    );
  }

  private getUsername(): PromiseLike<string> {
    const username = vscode.workspace
      .getConfiguration('greybel')
      .get<string>('createIngame.steamUser');

    if (username != null) {
      return Promise.resolve(username);
    }

    return vscode.window.showInputBox({
      title: 'Enter steam account name',
      ignoreFocusOut: true
    });
  }

  private getPassword(): PromiseLike<string> {
    return vscode.window.showInputBox({
      title: 'Enter steam password',
      ignoreFocusOut: true,
      password: true
    });
  }

  async createAgent(): Promise<any> {
    switch (this.agentType) {
      case AgentType.C2: {
        const refreshToken = await this.extensionContext.secrets.get(
          'greybel.steam.refreshToken'
        );

        return new GreybelC2Agent(
          {
            connectionType: IMPORTER_MODE_MAP[this.mode],
            steamGuardGetter: async (domain, callback) => {
              const code = await vscode.window.showInputBox({
                title: `Enter steam guard code (send to ${domain})`,
                ignoreFocusOut: true,
                password: true
              });
              callback(code);
            },
            refreshToken,
            onSteamRefreshToken: (code: string) => {
              this.extensionContext.secrets.store(
                'greybel.steam.refreshToken',
                code
              );
            },
            credentialsGetter: async (label: string) => {
              if (label.includes('password')) {
                return await this.getPassword();
              }
              return await this.getUsername();
            }
          },
          [125, 150]
        );
      }
      case AgentType.C2Light: {
        return new GreybelC2LightAgent([125, 150]);
      }
    }
  }

  async import(): Promise<ImportResult[]> {
    if (!Object.prototype.hasOwnProperty.call(IMPORTER_MODE_MAP, this.mode)) {
      throw new Error('Unknown import mode.');
    }

    const agent = await this.createAgent();
    const results: ImportResult[] = [];

    for (const item of this.importRefs.values()) {
      const response = await agent.tryToCreateFile(
        this.ingameDirectory + path.posix.dirname(item.ingameFilepath),
        path.basename(item.ingameFilepath),
        item.content
      );

      if (response.success) {
        console.log(`Imported ${item.ingameFilepath} successful`);
        results.push({ path: item.ingameFilepath, success: true });
      } else {
        results.push({
          path: item.ingameFilepath,
          success: false,
          reason: response.message
        });

        switch (response.message) {
          case ErrorResponseMessage.OutOfRam:
          case ErrorResponseMessage.DesktopUI:
          case ErrorResponseMessage.CanOnlyRunOnComputer:
          case ErrorResponseMessage.CannotBeExecutedRemotely:
          case ErrorResponseMessage.CannotLaunch:
          case ErrorResponseMessage.NotAttached:
          case ErrorResponseMessage.DeviceNotFound:
          case ErrorResponseMessage.NoInternet:
          case ErrorResponseMessage.InvalidCommand: {
            console.log(`Importing got aborted due to ${response.message}`);
            return results;
          }
          default: {
            console.error(
              `Importing of ${item.ingameFilepath} failed due to ${response.message}`
            );
          }
        }
      }
    }

    if (this.autoCompile) {
      const rootRef = this.importRefs.get(this.target);

      await agent.tryToEvaluate(
        generateAutoCompileCode(
          this.ingameDirectory,
          rootRef.ingameFilepath,
          Array.from(this.importRefs.values()).map((it) => it.ingameFilepath)
        ),
        ({ output }) => console.log(output)
      );
    }

    if (this.postCommand !== '') {
      if (this.agentType === AgentType.C2Light) {
        agent.tryToRun(
          null,
          'cd ' + this.ingameDirectory,
          ({ output }) => console.log(output)
        );
        await wait(500);
        agent.tryToRun(
          null,
          this.postCommand,
          ({ output }) => console.log(output)
        );
        await wait(500);
        agent.terminal = null;
      } else {
        console.warn(
          `Warning: Post command can only be executed when agent type is ${AgentType.C2Light}`
        );
      }
    }

    await agent.dispose();

    return results;
  }
}

export const createImporter = async (
  options: ImporterOptions
): Promise<ImportResult[]> => {
  const importer = new Importer(options);
  return await importer.import();
};
