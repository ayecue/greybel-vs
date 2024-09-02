import { ResourceHandler as InterpreterResourceHandler } from 'greybel-interpreter';
import {
  ResourceHandler as TranspilerResourceHandler,
  ResourceProvider as TranspilerResourceProviderBase
} from 'greybel-transpiler';
import vscode, { Uri } from 'vscode';
import { tryToDecode, tryToGet, tryToGetPath } from './helper/fs';

const getBasePath = (source: string, target: string) => {
  const sourceUri = Uri.parse(source);
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(sourceUri);
  if (workspaceFolder == null) {
    console.warn('Workspace folders is not available. Falling back to only relative paths.');
    return Uri.joinPath(sourceUri, '..');
  }
  return target.startsWith('/') ? workspaceFolder.uri : Uri.joinPath(sourceUri, '..');
};

export class TranspilerResourceProvider extends TranspilerResourceProviderBase {
  getHandler(): TranspilerResourceHandler {
    return {
      getTargetRelativeTo: async (
        source: string,
        target: string
      ): Promise<string> => {
        const base = getBasePath(source, target);
        const uri = Uri.joinPath(base, target);
        const uriAlt = Uri.joinPath(base, `${target}.src`);
        const result = await tryToGetPath(uri, uriAlt);
        return result.toString();
      },
      has: async (target: string): Promise<boolean> => {
        return !!(await tryToGet(Uri.parse(target)));
      },
      get: (target: string): Promise<string> => {
        return tryToDecode(Uri.parse(target));
      },
      resolve: (target: string): Promise<string> => {
        return Promise.resolve(Uri.parse(target).toString());
      }
    };
  }
}

export class InterpreterResourceProvider extends InterpreterResourceHandler {
  async getTargetRelativeTo(source: string, target: string): Promise<string> {
    const base = getBasePath(source, target);
    const uri = Uri.joinPath(base, target);
    const uriAlt = Uri.joinPath(base, `${target}.src`);
    const result = await tryToGetPath(uri, uriAlt);
    return result.toString();
  }

  async has(target: string): Promise<boolean> {
    return !!(await tryToGet(Uri.parse(target)));
  }

  get(target: string): Promise<string> {
    return tryToDecode(Uri.parse(target));
  }

  resolve(target: string): Promise<string> {
    return Promise.resolve(Uri.parse(target).toString());
  }
}
