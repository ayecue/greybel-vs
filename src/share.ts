import vscode, { ExtensionContext, TextEditor, Uri } from 'vscode';

import { post } from './helper/request';
import { showCustomErrorMessage } from './helper/show-custom-error';

export function activate(context: ExtensionContext) {
  async function share(editor: TextEditor) {
    const content = editor.document.getText();

    try {
      const response = await post(
        `${process.env.GREYBEL_EDITOR_URL}/.netlify/functions/code`,
        {
          json: { content }
        }
      );
      console.log(response);
      const uri = Uri.parse(
        `${process.env.GREYBEL_EDITOR_URL}?id=${response.id}`
      );

      vscode.env.clipboard.writeText(uri.toString());
      vscode.window
        .showInformationMessage(
          'Editor link got created and copied to clipboard.',
          { modal: false },
          'Go to link'
        )
        .then(async () => {
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
