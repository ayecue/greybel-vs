import vscode, {
  ExtensionContext,
  Uri
} from 'vscode';

import { showCustomErrorMessage } from './helper/show-custom-error';
import { executeImport } from './build/importer';
import { GlobalFileSystemManager } from './helper/fs';
import { getIngameDirectory } from './helper/get-ingame-directory';
import { VersionManager } from './helper/version-manager';

const getFiles = async (uri: vscode.Uri): Promise<vscode.Uri[]> => {
  const stat = await vscode.workspace.fs.stat(uri);

  if (stat.type === vscode.FileType.Directory) {
    const relativePattern: vscode.RelativePattern = new vscode.RelativePattern(
      uri,
      '**/*'
    );

    return await vscode.workspace.findFiles(relativePattern);
  } else if (stat.type === vscode.FileType.File) {
    return [
      uri
    ];
  }

  return [];
}

export function activate(context: ExtensionContext) {
  async function importIngame(
    eventUri: Uri = vscode.window.activeTextEditor?.document?.uri
  ) {
    try {
      const files = await getFiles(eventUri);

      if (files.length === 0) {
        vscode.window.showInformationMessage('No files found!', {
          modal: false
        });
        return;
      }

      const targetUri = eventUri;
      const config = vscode.workspace.getConfiguration('greybel');
      const port = config.get<number>('createIngame.port');
      const ingameDirectory = await getIngameDirectory(config);
      const filesWithContent = await Promise.all(files.map(async (file) => {
        const content = await GlobalFileSystemManager.tryToDecode(file);

        return {
          path: file.toString(),
          content: content ?? ''
        };
      }));

      await executeImport({
        target: targetUri,
        ingameDirectory: ingameDirectory.path.replace(/\/$/i, ''),
        result: filesWithContent.reduce((result, item) => {
          result[item.path] = item.content;
          return result;
        }, {}),
        extensionContext: context,
        port,
        autoCompile: false,
        allowImport: false
      });

      VersionManager.triggerContextAgentHealthcheck(port);
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('greybel.import', importIngame)
  );
}
