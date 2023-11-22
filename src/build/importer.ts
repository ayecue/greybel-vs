import GreybelC2AgentPkg from 'greybel-proxy';
import { TranspilerParseResult } from 'greybel-transpiler';
import path from 'path';
import vscode, { ExtensionContext } from 'vscode';

import { createBasePath } from '../helper/create-base-path';
const { GreybelC2Agent } = GreybelC2AgentPkg;

const IMPORTER_MODE_MAP = {
  local: 2,
  public: 0
};

type ImportItem = {
  ingameFilepath: string;
  content: string;
};

type ImportResult = {
  path: string;
  success: boolean;
};

export interface ImporterOptions {
  target: string;
  ingameDirectory: string;
  result: TranspilerParseResult;
  extensionContext: ExtensionContext;
}

class Importer {
  private importList: ImportItem[];
  private target: string;
  private ingameDirectory: string;
  private mode: string;
  private extensionContext: ExtensionContext;

  constructor(options: ImporterOptions) {
    this.target = options.target;
    this.ingameDirectory = options.ingameDirectory;
    this.importList = this.createImportList(options.target, options.result);
    this.mode = vscode.workspace
      .getConfiguration('greybel')
      .get<string>('createIngame.mode');
    this.extensionContext = options.extensionContext;
  }

  private createImportList(
    rootTarget: string,
    parseResult: TranspilerParseResult
  ): ImportItem[] {
    const imports = Object.entries(parseResult).map(([target, code]) => {
      const ingameFilepath = createBasePath(rootTarget, target, '');

      return {
        ingameFilepath,
        content: code
      };
    });

    return imports;
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

  async import(): Promise<ImportResult[]> {
    if (!Object.prototype.hasOwnProperty.call(IMPORTER_MODE_MAP, this.mode)) {
      throw new Error('Unknown import mode.');
    }

    const refreshToken = await this.extensionContext.secrets.get(
      'greybel.steam.refreshToken'
    );

    const agent = new GreybelC2Agent({
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
        this.extensionContext.secrets.store('greybel.steam.refreshToken', code);
      },
      credentialsGetter: async (label: string) => {
        if (label.includes('password')) {
          return await this.getPassword();
        }
        return await this.getUsername();
      }
    });
    const results: ImportResult[] = [];

    for (const item of this.importList) {
      const isCreated = await agent.tryToCreateFile(
        this.ingameDirectory + path.posix.dirname(item.ingameFilepath),
        path.basename(item.ingameFilepath),
        item.content
      );

      if (isCreated) {
        console.log(`Imported ${item.ingameFilepath} successful`);
        results.push({ path: item.ingameFilepath, success: true });
      } else {
        console.log(`Importing of ${item.ingameFilepath} failed`);
        results.push({ path: item.ingameFilepath, success: false });
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
