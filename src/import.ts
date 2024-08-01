import vscode, {
  ExtensionContext,
  Uri
} from 'vscode';

import { showCustomErrorMessage } from './helper/show-custom-error';
import { AgentType, ImportResultFailure, ImportResultSuccess, ImporterMode, createImporter } from './build/importer';
import { tryToDecode } from './helper/fs';

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
      const ingameDirectory = Uri.file(
        config.get<string>('transpiler.ingameDirectory')
      );
      const filesWithContent = await Promise.all(files.map(async (file) => {
        const content = await tryToDecode(file);

        return {
          path: file.toString(true),
          content
        };
      }));
      const results = await createImporter({
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
        postCommand: ''
      });
      const successfulItems = results.filter((item) => item.success) as ImportResultSuccess[];
      const failedItems = results.filter((item) => !item.success) as ImportResultFailure[];

      if (successfulItems.length === 0) {
        vscode.window.showInformationMessage(`File import failed! This can happen if Grey Hack received an update and sometimes due to other issues.`, {
          modal: true,
          detail: failedItems.map((it) => it.reason).join('\n')
        });
      } else if (failedItems.length > 0) {
        vscode.window.showInformationMessage(`Import was only partially successful. Only ${successfulItems.length} files got imported to ${ingameDirectory.path}!`, {
          modal: true,
          detail: failedItems.map((it) => it.reason).join('\n')
        });
      } else {
        vscode.window.showInformationMessage(`${successfulItems.length} files got imported to ${ingameDirectory.path}!`, {
          modal: false
        });
      }
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('greybel.import', importIngame)
  );
}
