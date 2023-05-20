import { TranspilerParseResult } from 'greybel-transpiler';
import vscode, { Uri } from 'vscode';

import { PseudoFS } from '../resource';

const createRelativePath = (
  targetRootSegments: string[],
  path: string
): string => {
  const pathSegments = path.split(PseudoFS.sep);
  const filtered = [];

  for (const segment of targetRootSegments) {
    const current = pathSegments.shift();

    if (current !== segment) {
      break;
    }

    filtered.push(current);
  }

  return path.replace(`${filtered.join(PseudoFS.sep)}`, '.');
};

export const createParseResult = async (
  target: string,
  buildPath: Uri,
  result: TranspilerParseResult
): Promise<void> => {
  const targetRootSegments = Uri.joinPath(Uri.file(target), '..').fsPath.split(
    PseudoFS.sep
  );
  const relativePathFactory: (filePath: string) => string =
    createRelativePath.bind(null, targetRootSegments);

  await Promise.all(
    Object.entries(result).map(([file, code]) => {
      const relativePath = relativePathFactory(file);
      const fullPath = Uri.joinPath(buildPath, relativePath);
      return vscode.workspace.fs.writeFile(
        fullPath,
        new TextEncoder().encode(code)
      );
    })
  );
};
