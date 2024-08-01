import { Uri } from 'vscode';

export const createBasePath = (
  targetUri: Uri,
  path: string,
  base: string = '.'
): string => {
  const targetRootSegments = Uri.joinPath(targetUri, '..').path.split('/');
  const pathUri = Uri.parse(path);
  const pathSegments = pathUri.path.split('/');
  const filtered = [];

  for (const segment of targetRootSegments) {
    const current = pathSegments.shift();

    if (current !== segment) {
      break;
    }

    filtered.push(current);
  }

  return pathUri.path.replace(`${filtered.join('/')}`, base);
};
