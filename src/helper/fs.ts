import { crlf, LF } from 'crlf-normalize';
import path from 'path';
// @ts-ignore: No type definitions
import { TextDecoderLite as TextDecoder } from 'text-encoder-lite';
import vscode, { Uri } from 'vscode';

const fs = vscode.workspace.fs;

export class PseudoFS {
  static basename(file: string): string {
    return path.basename(file);
  }

  static dirname(file: string): string {
    return path.dirname(file);
  }

  static resolve(file: string): string {
    return path.resolve(file);
  }
}

export async function tryToGet(
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

export function getWorkspaceFolderUri(source: Uri): Uri | null {
  const uris = vscode.workspace.workspaceFolders;
  return (
    uris.find((folderUri) => source.path.startsWith(folderUri.uri.path))?.uri ??
    null
  );
}

export async function findExistingPath(
  mainUri: Uri,
  ...altUris: Uri[]
): Promise<Uri | null> {
  const mainItem = await tryToGet(mainUri, true);
  if (mainItem != null) return mainUri;

  if (altUris.length === 0) {
    return null;
  }

  try {
    const altItemUri = await Promise.any(
      altUris.map(async (uri) => {
        const item = await tryToGet(uri, true);
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

export async function tryToDecode(
  targetUri: Uri,
  unsafe: boolean = false
): Promise<string | null> {
  const out = await tryToGet(targetUri, unsafe);

  if (out != null) {
    const content = new TextDecoder().decode(out);
    return crlf(content, LF);
  }

  return null;
}
