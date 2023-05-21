import { TranspilerParseResult } from 'greybel-transpiler';
import vscode, { Uri } from 'vscode';

import { createBasePath } from '../helper/create-base-path';

export const createParseResult = async (
  target: string,
  buildPath: Uri,
  result: TranspilerParseResult
): Promise<void> => {
  const relativePathFactory: (filePath: string) => string = createBasePath.bind(
    null,
    target
  );

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
