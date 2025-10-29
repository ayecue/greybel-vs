import EventEmitter from 'events';
import { TranspilerParseResult } from 'greybel-transpiler';
import { BuildAgent as Agent } from 'greyhack-message-hook-client';
import vscode, { ExtensionContext, Uri } from 'vscode';

import { createBasePath } from '../helper/create-base-path';
import { generateAutoCompileCode } from './scripts/auto-compile-helper';
import { generateAutoGenerateFoldersCode } from './scripts/auto-generate-folders';

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
  resourceDirectory: string;
  result: TranspilerParseResult;
  port: number;
  extensionContext: ExtensionContext;
  autoCompile: boolean;
  allowImport: boolean;
}

class Importer {
  private importRefs: Map<string, ImportItem>;
  private target: Uri;
  private agent: any;
  private _instance: any;
  private port: number;
  private ingameDirectory: string;
  private resourceDirectory: string;
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
    this.resourceDirectory = options.resourceDirectory
      .trim()
      .replace(/\/$/i, '');
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
      generateAutoGenerateFoldersCode(ingamePaths)
    );
  }

  private async addResources(): Promise<void> {
    const items = Array.from(this.importRefs.values());

    // increase max listeners to avoid warning when importing many files
    this.agent.buildClient.core._responseManager.setMaxListeners(
      items.length + 1
    );

    await Promise.all(
      items.map((item) => {
        return this._instance.addResourceToBuild(
          item.ingameFilepath,
          item.content
        );
      })
    );

    this.agent.buildClient.core._responseManager.setMaxListeners(
      EventEmitter.defaultMaxListeners
    );
  }

  private async addAutoCompile(): Promise<void> {
    const rootRef = this.importRefs.get(this.target.toString());
    const ingamePaths = Array.from(this.importRefs.values()).map(
      (it) => it.ingameFilepath
    );
    await this._instance.addScriptToBuild(
      20,
      generateAutoCompileCode(
        rootRef.ingameFilepath,
        ingamePaths,
        this.allowImport
      )
    );
  }

  async import(): Promise<ImportResult> {
    try {
      const result = await this.agent.tryToCreateBuild(
        this.ingameDirectory,
        this.resourceDirectory,
        this.autoCompile
      );

      if (!result.success) {
        return {
          buildID: null,
          state: BuildState.Unknown,
          errorMessage: result.message,
          output: ''
        };
      }

      this._instance = result.value;

      await this.addPrepareFoldersScript();
      await this.addResources();

      if (this.autoCompile) {
        await this.addAutoCompile();
      }

      await this._instance.performBuild();

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
