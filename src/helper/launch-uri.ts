import vscode, { Uri } from 'vscode';

export function getLaunchResourceUri(
  runRootFilePath: string | undefined,
  resource: Uri
): Uri | null {
  if (runRootFilePath != null && runRootFilePath != '') {
    const rootPath = vscode.workspace.getWorkspaceFolder(resource);

    if (rootPath != null) {
      return Uri.joinPath(rootPath.uri, runRootFilePath);
    }

    if (resource == null) {
      return null;
    }

    const rootPathUri = Uri.joinPath(resource, '..');
    return Uri.joinPath(rootPathUri, runRootFilePath);
  }

  return resource;
}
