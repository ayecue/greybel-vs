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
        const base = target.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(Uri.parse(source), '..');
        const uri = Uri.joinPath(base, target);
        const uriAlt = Uri.joinPath(base, `${target}.src`);
        const result = await tryToGetPath(uri, uriAlt);
        return result.toString(true);
      },
      has: async (target: string): Promise<boolean> => {
        return !!(await tryToGet(Uri.parse(target)));
      },
      get: (target: string): Promise<string> => {
        return tryToDecode(Uri.parse(target));
      },
      resolve: (target: string): Promise<string> => {
        return Promise.resolve(Uri.parse(target).toString(true));
      }
    };
  }
}

export class InterpreterResourceProvider extends InterpreterResourceHandler {
  async getTargetRelativeTo(source: string, target: string): Promise<string> {
    const base = target.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(Uri.parse(source), '..');
    const uri = Uri.joinPath(base, target);
    const uriAlt = Uri.joinPath(base, `${target}.src`);
    const result = await tryToGetPath(uri, uriAlt);
    return result.toString(true);
  }

  async has(target: string): Promise<boolean> {
    return !!(await tryToGet(Uri.parse(target)));
  }

  get(target: string): Promise<string> {
    return tryToDecode(Uri.parse(target));
  }

  resolve(target: string): Promise<string> {
    return Promise.resolve(Uri.parse(target).toString(true));
  }
}
