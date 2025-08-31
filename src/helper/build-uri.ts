import vscode, { Uri } from 'vscode';

export function getBuildTargetUri(
  buildRootFilePath: string | undefined,
  eventUri: Uri
): Uri {
  if (buildRootFilePath != null && buildRootFilePath != '') {
    const rootPath = vscode.workspace.getWorkspaceFolder(eventUri);

    if (rootPath != null) {
      return Uri.joinPath(rootPath.uri, buildRootFilePath);
    }

    if (eventUri == null) {
      return null;
    }

    const rootPathUri = Uri.joinPath(eventUri, '..');
    return Uri.joinPath(rootPathUri, buildRootFilePath);
  }
  return eventUri;
}

export function getPotentialBuildTargetUri(
  buildRootFilePath: string | undefined,
  relatedUri: Uri
): Uri {
  if (buildRootFilePath != null && buildRootFilePath != '') {
    const rootPath = vscode.workspace.getWorkspaceFolder(relatedUri);

    if (rootPath != null) {
      return Uri.joinPath(rootPath.uri, buildRootFilePath);
    }

    return null;
  }
  return null;
}

export function getBuildRootUri(targetUri: Uri): Uri {
  const rootPath = vscode.workspace.getWorkspaceFolder(targetUri);

  return rootPath ? rootPath.uri : Uri.joinPath(targetUri, '..');
}

export function getBuildOutputUri(rootPathUri: Uri): Uri {
  return Uri.joinPath(rootPathUri, './build');
}
