import { crlf, LF } from 'crlf-normalize';
import path from 'path';
// @ts-ignore: No type definitions
import { TextDecoderLite as TextDecoder } from 'text-encoder-lite';
import vscode, { Uri } from 'vscode';

const fs = vscode.workspace.fs;

export class FileSystemManager {
  basename(file: string): string {
    return path.basename(file);
  }

  dirname(file: string): string {
    return path.dirname(file);
  }

  resolve(file: string): string {
    return path.resolve(file);
  }

  async tryToGet(
    targetUri: Uri,
    unsafe: boolean = false
  ): Promise<Uint8Array | null> {
    try {
      return await fs.readFile(targetUri);
    } catch (err) {
      if (!unsafe) console.error(err);
    }

    return null;
  }

  async tryToDecode(
    targetUri: Uri,
    unsafe: boolean = false
  ): Promise<string | null> {
    const out = await this.tryToGet(targetUri, unsafe);

    if (out != null) {
      const content = new TextDecoder().decode(out);
      return crlf(content, LF);
    }

    return null;
  }

  getWorkspaceFolderUri(source: Uri): Uri | null {
    const uris = vscode.workspace.workspaceFolders;
    return (
      uris.find((folderUri) => source.path.startsWith(folderUri.uri.path))?.uri ??
      null
    );
  }

  async findExistingPath(
    mainUri: Uri,
    ...altUris: Uri[]
  ): Promise<Uri | null> {
    const mainItem = await this.tryToGet(mainUri, true);
    if (mainItem != null) return mainUri;

    if (altUris.length === 0) {
      return null;
    }

    try {
      const altItemUri = await Promise.any(
        altUris.map(async (uri) => {
          const item = await this.tryToGet(uri, true);
          if (item != null) return uri;
          throw new Error('Alternative path could not resolve');
        })
      );

      if (altItemUri != null) {
        return altItemUri;
      }

      return null;
    } catch (err) {
      return null;
    }
  }
}

export class FileSystemManagerWithCache extends FileSystemManager {
  private fileContentCache: Map<string, Uint8Array>;
  private pathResolveCache: Map<string, Uri>;

  constructor() {
    super();
    this.fileContentCache = new Map<string, Uint8Array>();
    this.pathResolveCache = new Map<string, Uri>();
  }

  async tryToGet(targetUri: Uri, unsafe: boolean = false): Promise<Uint8Array | null> {
    const key = targetUri.toString();
    const result = this.fileContentCache.get(key);

    if (result) {
      return result;
    }

    const content = await super.tryToGet(targetUri, unsafe);
    this.fileContentCache.set(key, content);
    return content;
  }

  async findExistingPath(mainUri: Uri, ...altUris: Uri[]): Promise<Uri | null> {
    const key = mainUri.toString();
    const cachedUri = this.pathResolveCache.get(key);

    if (cachedUri) {
      return cachedUri;
    }

    const result = await super.findExistingPath(mainUri, ...altUris);
    this.pathResolveCache.set(key, result);
    return result;
  }
}

export const GlobalFileSystemManager = new FileSystemManager();