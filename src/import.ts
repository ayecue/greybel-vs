import vscode, {
  ExtensionContext,
  TextEditor,
  TextEditorEdit,
  Uri
} from 'vscode';
import path from 'path';

import { showCustomErrorMessage } from './helper/show-custom-error';
import { createImporter } from './build/importer';

export function activate(context: ExtensionContext) {
  async function share(
    editor: TextEditor,
    _edit: TextEditorEdit,
    eventUri: Uri
  ) {
    try {
      const config = vscode.workspace.getConfiguration('greybel');
      const target = eventUri.fsPath;
      const doc = await vscode.workspace.openTextDocument(target);
      const content = doc.getText();
      const ingameDirectory = Uri.file(
        config.get<string>('transpiler.ingameDirectory')
      );
      
      await createImporter({
        target,
        ingameDirectory: ingameDirectory.path.replace(/\/$/i, ''),
        result: {
          [target]: content
        },
        extensionContext: context
      });

      vscode.window.showInformationMessage(`${target} got imported to ${ingameDirectory.fsPath}!`, {
          modal: false
        });
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.import', share)
  );
}
