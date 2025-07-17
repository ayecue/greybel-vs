import { ResourceHandler as InterpreterResourceHandler } from 'greybel-interpreter';
import {
  ResourceHandler as TranspilerResourceHandler,
  ResourceProvider as TranspilerResourceProviderBase
} from 'greybel-transpiler';
import vscode, { Uri } from 'vscode';
import { DocumentURIBuilder } from './helper/document-manager';
import { FileSystemManager, FileSystemManagerWithCache } from './helper/fs';

const createDocumentUriBuilder = (source: string, fileSystem?: FileSystemManager) => {
  const sourceUri = Uri.parse(source);
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(sourceUri);
  return new DocumentURIBuilder(Uri.joinPath(sourceUri, '..'), workspaceFolder.uri, fileSystem);
};

export class TranspilerResourceProvider extends TranspilerResourceProviderBase {
  getHandler(): TranspilerResourceHandler {
    const fileManager = new FileSystemManagerWithCache();

    return {
      getTargetRelativeTo: async (
        source: string,
        target: string
      ): Promise<string> => {
        const documentUriBuilder = createDocumentUriBuilder(source, fileManager);
        const result = await documentUriBuilder.getPathUseReturnOriginal(target);
        return result.toString();
      },
      has: async (target: string): Promise<boolean> => {
        const hasItem = await fileManager.tryToGet(Uri.parse(target));
        return !!hasItem;
      },
      get: async (target: string): Promise<string> => {
        const result = await fileManager.tryToDecode(Uri.parse(target));
        return result ?? '';
      },
      resolve: (target: string): Promise<string> => {
        return Promise.resolve(Uri.parse(target).toString());
      }
    };
  }
}

export class InterpreterResourceProvider extends InterpreterResourceHandler {
  private fileManager: FileSystemManager;

  constructor() {
    super();
    this.fileManager = new FileSystemManagerWithCache();
  }

  async getTargetRelativeTo(source: string, target: string): Promise<string> {
    const documentUriBuilder = createDocumentUriBuilder(source, this.fileManager);
    const result = await documentUriBuilder.getPathUseReturnOriginal(target);
    return result.toString();
  }

  async has(target: string): Promise<boolean> {
    return !!(await this.fileManager.tryToGet(Uri.parse(target)));
  }

  async get(target: string): Promise<string> {
    const result = await this.fileManager.tryToDecode(Uri.parse(target));
    return result ?? '';
  }

  resolve(target: string): Promise<string> {
    return Promise.resolve(Uri.parse(target).toString());
  }
}
