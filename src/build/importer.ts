import { TranspilerParseResult } from 'greybel-transpiler';
import { GameAgent as Agent } from 'greyhack-message-hook-client';
import path from 'path';
import vscode, { ExtensionContext, Uri } from 'vscode';

import { createBasePath } from '../helper/create-base-path';
import { generateAutoCompileCode } from './auto-compile-helper';
// const { Agent } = GreyHackMessageHookClientPkg;

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
  C2Light = 'message-hook'
}

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
  target: Uri;
  ingameDirectory: string;
  agentType: AgentType;
  result: TranspilerParseResult;
  extensionContext: ExtensionContext;
  autoCompile: boolean;
  allowImport: boolean;
}

class Importer {
  private importRefs: Map<string, ImportItem>;
  private agentType: AgentType;
  private target: Uri;
  private ingameDirectory: string;
  private extensionContext: ExtensionContext;
  private autoCompile: boolean;
  private allowImport: boolean;

  constructor(options: ImporterOptions) {
    this.target = options.target;
    this.ingameDirectory = options.ingameDirectory.trim().replace(/\/$/i, '');
    this.importRefs = this.createImportList(options.target, options.result);
    this.agentType = options.agentType;
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

  async createAgent(): Promise<any> {
    switch (this.agentType) {
      case AgentType.C2Light: {
        return new Agent({
          warn: () => { },
          error: () => { },
          info: () => { },
          debug: () => { }
        });
      }
    }
  }

  async import(): Promise<ImportResult[]> {
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
      const rootRef = this.importRefs.get(this.target.toString());

      await agent.tryToEvaluate(
        generateAutoCompileCode(
          this.ingameDirectory,
          rootRef.ingameFilepath,
          Array.from(this.importRefs.values()).map((it) => it.ingameFilepath),
          this.allowImport
        ),
        ({ output }) => console.log(output)
      );
    }

    await agent.dispose();

    return results;
  }
}

enum CommonImportErrorReason {
  NoAvailableSocket = 'There is no available socket!',
  NewGameVersion = 'A new game update is available.'
}

const reportFailure = (failedItems: ImportResultFailure[]): void => {
  const uniqueErrorReasons = new Set(failedItems.map((it) => it.reason));

  if (uniqueErrorReasons.size === 1) {
    const singularErrorReason = failedItems[0].reason;

    if (
      singularErrorReason.indexOf(CommonImportErrorReason.NoAvailableSocket) !==
      -1
    ) {
      vscode.window.showInformationMessage(`File import failed`, {
        modal: true,
        detail: `The issue appears to be due to the lack of an available socket. This could suggest that the BepInEx plugin is not installed correctly, or the game is not running. Double-check the plugin installation and ensure the game is running.

For detailed troubleshooting steps, please consult the documentation: https://github.com/ayecue/greybel-vs?tab=readme-ov-file#message-hook.`
      });
      return;
    } else if (
      singularErrorReason.indexOf(CommonImportErrorReason.NewGameVersion) !== -1
    ) {
      vscode.window.showInformationMessage(`File import failed`, {
        modal: true,
        detail: `It seems that the game has received an update. This can sometimes cause issues with the import process. Please wait for the Greybel developers to update the extension and try again later.`
      });
      return;
    }

    vscode.window.showInformationMessage(`File import failed`, {
      modal: true,
      detail: `The reason seems to be unknown for now. Please either join the discord or create an issue on GitHub. Following reason was reported: ${singularErrorReason}`
    });

    return;
  }

  vscode.window.showInformationMessage(`File import failed`, {
    modal: true,
    detail: `The reason seems to be unknown for now. Please either join the discord or create an issue on GitHub. Following reasons were reported:\n${failedItems
      .map((it) => it.reason)
      .join('\n')}`
  });
};

export const executeImport = async (
  options: ImporterOptions
): Promise<boolean> => {
  const importer = new Importer(options);
  const results = await importer.import();

  const successfulItems = results.filter(
    (item) => item.success
  ) as ImportResultSuccess[];
  const failedItems = results.filter(
    (item) => !item.success
  ) as ImportResultFailure[];

  if (successfulItems.length === 0) {
    reportFailure(failedItems);
    return false;
  } else if (failedItems.length > 0) {
    vscode.window.showInformationMessage(
      `Import was only partially successful. Only ${successfulItems.length} files got imported to ${options.ingameDirectory}!`,
      {
        modal: true,
        detail: failedItems.map((it) => it.reason).join('\n')
      }
    );
    return false;
  }

  vscode.window.showInformationMessage(
    `${successfulItems.length} files got imported to ${options.ingameDirectory}!`,
    {
      modal: false
    }
  );

  return true;
};
