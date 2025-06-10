import vscode, { ExtensionContext, Uri } from 'vscode';
import { getContent } from './api/generate-page';

export async function displayAPIDocumentation(
  context: ExtensionContext,
  searchText: string = ''
) {
  const panel = vscode.window.createWebviewPanel(
    'greyScriptAPI',
    'GreyScript API',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [Uri.file(context.extensionPath)]
    }
  );

  const indexStylesheet = Uri.joinPath(Uri.file(context.extensionPath), 'api.view.css');
  const indexScript = Uri.joinPath(Uri.file(context.extensionPath), 'api.view.js');

  panel.webview.html = getContent({
    panel,
    indexScript,
    indexStylesheet,
    searchText
  });
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('greybel.api', () =>
      displayAPIDocumentation(context)
    )
  );
}
