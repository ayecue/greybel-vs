import vscode, { ExtensionContext, TextDocumentChangeEvent } from 'vscode';

import documentParseQueue from './helper/document-manager';

export function activate(context: ExtensionContext) {
  const update = documentParseQueue.update.bind(documentParseQueue);
  const clear = documentParseQueue.clear.bind(documentParseQueue);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(update),
    vscode.workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        update(event.document);
      }
    ),
    vscode.workspace.onDidSaveTextDocument(update),
    vscode.workspace.onDidCloseTextDocument(clear)
  );
}
