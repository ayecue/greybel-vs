import path from 'path';
// @ts-ignore: No type definitions
import { TextDecoderLite as TextDecoder } from 'text-encoder-lite';
import vscode, { Uri } from 'vscode';

const fs = vscode.workspace.fs;

export class PseudoFS {
  static sep: string = path.sep;
  static win32 = path.win32;
  static posix = path.posix;

  static basename(file: string): string {
    return path.basename(file);
  }

  static dirname(file: string): string {
    return path.dirname(file);
  }

  static resolve(file: string): string {
    return path.resolve(file);
  }

  static isWindows() {
    return this.win32.sep === this.sep;
  }
}

export async function tryToGet(targetUri: string): Promise<Uint8Array | null> {
  try {
    return await fs.readFile(Uri.file(targetUri));
  } catch (err) {
    console.error(err);
  }

  return null;
}

export async function tryToGetPath(
  targetUri: string,
  altTargetUri: string
): Promise<string> {
  if (await tryToGet(targetUri)) {
    return targetUri;
  } else if (await tryToGet(altTargetUri)) {
    return altTargetUri;
  }
  return targetUri;
}

export async function tryToDecode(targetUri: string): Promise<string> {
  const out = await tryToGet(targetUri);
  return out ? new TextDecoder().decode(out) : '';
}
