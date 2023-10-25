import vscode, {
  ExtensionContext,
  TextEditor,
  TextEditorEdit,
  Uri
} from 'vscode';

import { post } from './helper/request';
import { showCustomErrorMessage } from './helper/show-custom-error';

export function activate(context: ExtensionContext) {
  async function clearSecrets() {
    try {
      await context.secrets.delete(
        'greybel.steam.refreshToken'
      );
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.clearSecrets', clearSecrets)
  );
}
