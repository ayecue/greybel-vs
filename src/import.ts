import vscode, {
  ExtensionContext,
  Uri
} from 'vscode';

import { showCustomErrorMessage } from './helper/show-custom-error';
import { AgentType, executeImport, ImporterMode } from './build/importer';
import { tryToDecode } from './helper/fs';
import { getIngameDirectory } from './helper/get-ingame-directory';

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
      const ingameDirectory = await getIngameDirectory(config);
      const filesWithContent = await Promise.all(files.map(async (file) => {
        const content = await tryToDecode(file);

        return {
          path: file.toString(),
          content
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
        mode: vscode.workspace
          .getConfiguration('greybel')
          .get<ImporterMode>('createIngame.mode'),
        agentType: vscode.workspace
          .getConfiguration('greybel')
          .get<AgentType>('createIngame.agent'),
        autoCompile: false,
        postCommand: '',
        allowImport: false
      });
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('greybel.import', importIngame)
  );
}
