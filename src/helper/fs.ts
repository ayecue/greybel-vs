import { crlf, LF } from 'crlf-normalize';
import path from 'path';
// @ts-ignore: No type definitions
import { TextDecoderLite as TextDecoder } from 'text-encoder-lite';
import vscode from 'vscode';

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
  targetUri: vscode.Uri
): Promise<Uint8Array | null> {
  try {
    return await fs.readFile(targetUri);
  } catch (err) {
    console.error(err);
  }

  return null;
}

export async function tryToGetPath(
  targetUri: vscode.Uri,
  altTargetUri: vscode.Uri
): Promise<vscode.Uri> {
  if (await tryToGet(targetUri)) {
    return targetUri;
  } else if (await tryToGet(altTargetUri)) {
    return altTargetUri;
  }
  return targetUri;
}

export async function tryToDecode(targetUri: vscode.Uri): Promise<string> {
  const out = await tryToGet(targetUri);

  if (out) {
    const content = new TextDecoder().decode(out);
    return crlf(content, LF);
  }

  return '';
}
