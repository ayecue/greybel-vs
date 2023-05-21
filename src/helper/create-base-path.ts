import { Uri } from 'vscode';

import { PseudoFS } from '../resource';

export const createBasePath = (
  target: string,
  path: string,
  base: string = '.'
): string => {
  const targetRootSegments = Uri.joinPath(Uri.file(target), '..').fsPath.split(
    PseudoFS.sep
  );
  const pathSegments = path.split(PseudoFS.sep);
  const filtered = [];

  for (const segment of targetRootSegments) {
    const current = pathSegments.shift();

    if (current !== segment) {
      break;
    }

    filtered.push(current);
  }

  return path.replace(`${filtered.join(PseudoFS.sep)}`, base);
};
