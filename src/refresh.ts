import vscode, { ExtensionContext, Uri } from 'vscode';

import documentParseQueue from './helper/document-manager';
import documentManager from './helper/document-manager';

export function activate(context: ExtensionContext) {
  async function refresh(
    eventUri: Uri = vscode.window.activeTextEditor?.document?.uri
  ) {
    const result = await documentManager.open(eventUri);

    if (result === null) {
      return;
    }

    documentParseQueue.refresh(result.textDocument);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('greybel.refresh', refresh)
  );
}