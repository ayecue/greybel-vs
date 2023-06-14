import vscode, { ExtensionContext, TextEditor, TextEditorEdit, Uri } from 'vscode';

import { post } from './helper/request';
import { showCustomErrorMessage } from './helper/show-custom-error';

export function activate(context: ExtensionContext) {
  async function share(
    editor: TextEditor,
    _edit: TextEditorEdit,
    eventUri: Uri
  ) {
    try {
      const doc = await vscode.workspace.openTextDocument(eventUri.fsPath);
      const content = doc.getText();
      const response = await post(
        `${process.env.GREYBEL_EDITOR_URL}/.netlify/functions/code`,
        {
          json: { content }
        }
      );
      const link = `${process.env.GREYBEL_EDITOR_URL}?id=${response.id}`;

      vscode.env.clipboard.writeText(link);
      vscode.window
        .showInformationMessage(
          'Editor link got created and copied to clipboard.',
          { modal: false },
          'Go to link'
        )
        .then(async () => {
          const uri = Uri.parse(link);
          vscode.env.openExternal(uri);
        });
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.share', share)
  );
}
