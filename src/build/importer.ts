import { TranspilerParseResult } from 'greybel-transpiler';
import { BuildAgent as Agent } from 'greyhack-message-hook-client';
import vscode, { ExtensionContext, Uri } from 'vscode';

import { createBasePath } from '../helper/create-base-path';
import { generateAutoCompileCode } from './auto-compile-helper';
import { generateAutoGenerateFoldersCode } from './auto-generate-folders';

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

enum ClientMessageType {
  CreatedBuildRpc = 1100,
  AddedResourceToBuildRpc = 1101,
  AddedScriptRpc = 1102,
  BuildStateRpc = 1103,
  BuildFinishedRpc = 1104,
  DisposedBuildRpc = 1110
}

enum BuildState {
  Initial = 0,
  Allocating = 1,
  PreScript = 2,
  CreatingEntities = 3,
  PostScript = 4,
  Closing = 5,
  Complete = 10,
  Failed = 20,
  Unknown = 30
}

type ImportItem = {
  ingameFilepath: string;
  content: string;
};

export type ImportResult = {
  buildID: string;
  state: BuildState;
  errorMessage: string;
  output: string;
};

export interface ImporterOptions {
  target: Uri;
  ingameDirectory: string;
  result: TranspilerParseResult;
  port: number;
  extensionContext: ExtensionContext;
  autoCompile: boolean;
  allowImport: boolean;
}

class Importer {
  static readonly BlockingErrorMessages = new Set<string>([
    ErrorResponseMessage.OutOfRam,
    ErrorResponseMessage.DesktopUI,
    ErrorResponseMessage.CanOnlyRunOnComputer,
    ErrorResponseMessage.CannotBeExecutedRemotely,
    ErrorResponseMessage.CannotLaunch,
    ErrorResponseMessage.NotAttached,
    ErrorResponseMessage.DeviceNotFound,
    ErrorResponseMessage.NoInternet,
    ErrorResponseMessage.InvalidCommand
  ]);

  private importRefs: Map<string, ImportItem>;
  private target: Uri;
  private agent: any;
  private _instance: any;
  private port: number;
  private ingameDirectory: string;
  private extensionContext: ExtensionContext;
  private autoCompile: boolean;
  private allowImport: boolean;

  constructor(options: ImporterOptions) {
    this.agent = new Agent(
      {
        warn: () => {},
        error: () => {},
        info: () => {},
        debug: () => {}
      },
      this.port
    );
    this._instance = null;
    this.target = options.target;
    this.port = options.port;
    this.ingameDirectory = options.ingameDirectory.trim().replace(/\/$/i, '');
    this.importRefs = this.createImportList(options.target, options.result);
    this.extensionContext = options.extensionContext;
    this.autoCompile = options.autoCompile;
    this.allowImport = options.allowImport;
  }

  private createImportList(
    rootTarget: Uri,
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

  private async addPrepareFoldersScript(): Promise<void> {
    const ingamePaths = Array.from(this.importRefs.values()).map(
      (it) => it.ingameFilepath
    );

    await this._instance.addScriptToBuild(
      10,
      generateAutoGenerateFoldersCode(this.ingameDirectory, ingamePaths)
    );
  }

  private async addResources(): Promise<void> {
    const defers: Promise<any>[] = [];

    for (const item of this.importRefs.values()) {
      defers.push(
        this._instance.addResourceToBuild(
          this.ingameDirectory + item.ingameFilepath,
          item.content
        )
      );
    }

    await Promise.all(defers);
  }

  private async addAutoCompile(): Promise<void> {
    const rootRef = this.importRefs.get(this.target.toString());
    const ingamePaths = Array.from(this.importRefs.values()).map(
      (it) => it.ingameFilepath
    );
    await this._instance.addScriptToBuild(
      20,
      generateAutoCompileCode(
        this.ingameDirectory,
        rootRef.ingameFilepath,
        ingamePaths,
        this.allowImport
      )
    );
  }

  async import(): Promise<ImportResult> {
    try {
      const result = await this.agent.tryToCreateBuild();

      if (!result.success) {
        return {
          buildID: null,
          state: BuildState.Unknown,
          errorMessage: result.message,
          output: ''
        };
      }

      this._instance = result.value;

      console.time('Preparation Time');
      await this.addPrepareFoldersScript();
      await this.addResources();

      if (this.autoCompile) {
        await this.addAutoCompile();
      }

      console.timeEnd('Preparation Time');

      console.time('Build Time');
      await this._instance.performBuild();
      console.timeEnd('Build Time');

      const buildResult = await this._instance.waitForResponse((id) => {
        return (
          id === ClientMessageType.BuildFinishedRpc ||
          id === ClientMessageType.DisposedBuildRpc
        );
      });

      return {
        buildID: buildResult.buildID,
        state: buildResult.state as BuildState,
        errorMessage: buildResult.errorMessage,
        output: buildResult.output
      };
    } catch (e) {
      return {
        buildID: null,
        state: BuildState.Unknown,
        errorMessage: e.message,
        output: ''
      };
    } finally {
      try {
        await this._instance.dispose();
      } catch {}

      this._instance = null;
      await this.agent.dispose();
    }
  }
}

enum CommonImportErrorReason {
  NoAvailableSocket = 'There is no available socket!',
  NewGameVersion = 'A new game update is available.'
}

const reportFailure = (result: ImportResult): void => {
  if (
    result.errorMessage.indexOf(CommonImportErrorReason.NoAvailableSocket) !==
    -1
  ) {
    vscode.window.showInformationMessage(`File import failed`, {
      modal: true,
      detail: `The issue appears to be due to the lack of an available socket. This could suggest that the BepInEx plugin is not installed correctly, or the game is not running. Double-check the plugin installation and ensure the game is running.

For detailed troubleshooting steps, please consult the documentation: https://github.com/ayecue/greybel-vs?tab=readme-ov-file#message-hook.`
    });
    return;
  } else if (
    result.errorMessage.indexOf(CommonImportErrorReason.NewGameVersion) !== -1
  ) {
    vscode.window.showInformationMessage(`File import failed`, {
      modal: true,
      detail: `It seems that the game has received an update. This can sometimes cause issues with the import process. Please wait for the Greybel developers to update the extension and try again later.`
    });
    return;
  }

  vscode.window.showInformationMessage(`File import failed`, {
    modal: true,
    detail: result.errorMessage
  });
};

export const executeImport = async (
  options: ImporterOptions
): Promise<boolean> => {
  const importer = new Importer(options);
  const result = await importer.import();

  if (result.state !== BuildState.Complete) {
    reportFailure(result);
    return false;
  }

  vscode.window.showInformationMessage(
    `Files got imported to ${options.ingameDirectory}!`,
    {
      modal: false
    }
  );

  return true;
};
