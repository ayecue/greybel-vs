import unixify from 'unixify';
import { Uri } from 'vscode';

export const createBasePath = (
  targetUri: Uri,
  path: string,
  base: string = '.'
): string => {
  const targetRootSegments = unixify(
    Uri.joinPath(targetUri, '..').fsPath
  ).split('/');
  const pathUri = Uri.parse(path);
  const pathSegments = unixify(pathUri.fsPath).split('/');
  const filtered = [];

  for (const segment of targetRootSegments) {
    const current = pathSegments.shift();

    if (current !== segment) {
      break;
    }

    filtered.push(current);
  }

  return unixify(pathUri.fsPath).replace(`${filtered.join('/')}`, base);
};
