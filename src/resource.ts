import { ResourceHandler as InterpreterResourceHandler } from 'greybel-interpreter';
import {
  ResourceHandler as TranspilerResourceHandler,
  ResourceProvider as TranspilerResourceProviderBase
} from 'greybel-transpiler';
import vscode, { Uri } from 'vscode';
import { tryToDecode, tryToGet } from './helper/fs';
import { DocumentURIBuilder } from './helper/document-manager';

const createDocumentUriBuilder = (source: string) => {
  const sourceUri = Uri.parse(source);
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(sourceUri);
  return new DocumentURIBuilder(Uri.joinPath(sourceUri, '..'), workspaceFolder.uri);
};

export class TranspilerResourceProvider extends TranspilerResourceProviderBase {
  getHandler(): TranspilerResourceHandler {
    return {
      getTargetRelativeTo: async (
        source: string,
        target: string
      ): Promise<string> => {
        const documentUriBuilder = createDocumentUriBuilder(source);
        const result = await documentUriBuilder.getPath(target);
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
    const documentUriBuilder = createDocumentUriBuilder(source);
    const result = await documentUriBuilder.getPath(target);
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
