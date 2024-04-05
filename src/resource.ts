import { ResourceHandler as InterpreterResourceHandler } from 'greybel-interpreter';
import {
  ResourceHandler as TranspilerResourceHandler,
  ResourceProvider as TranspilerResourceProviderBase
} from 'greybel-transpiler';
import vscode, { Uri } from 'vscode';
import { tryToDecode, tryToGet, tryToGetPath } from './helper/fs';

export class TranspilerResourceProvider extends TranspilerResourceProviderBase {
  getHandler(): TranspilerResourceHandler {
    return {
      getTargetRelativeTo: async (
        source: string,
        target: string
      ): Promise<string> => {
        const base = target.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(Uri.file(source), '..');
        const result = Uri.joinPath(base, target).fsPath;
        return await tryToGetPath(result, `${result}.src`);
      },
      has: async (target: string): Promise<boolean> => {
        return !!(await tryToGet(target));
      },
      get: (target: string): Promise<string> => {
        return tryToDecode(target);
      },
      resolve: (target: string): Promise<string> => {
        return Promise.resolve(Uri.file(target).fsPath);
      }
    };
  }
}

export class InterpreterResourceProvider extends InterpreterResourceHandler {
  async getTargetRelativeTo(source: string, target: string): Promise<string> {
    const base = target.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(Uri.file(source), '..');
    const result = Uri.joinPath(base, target).fsPath;
    return await tryToGetPath(result, `${result}.src`);
  }

  async has(target: string): Promise<boolean> {
    return !!(await tryToGet(target));
  }

  get(target: string): Promise<string> {
    return tryToDecode(target);
  }

  resolve(target: string): Promise<string> {
    return Promise.resolve(Uri.file(target).fsPath);
  }
}
