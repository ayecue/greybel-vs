import vscode, { ExtensionContext, TextDocument, TextDocumentChangeEvent } from 'vscode';

import documentParseQueue from './helper/document-manager';

export function activate(context: ExtensionContext) {
  const update = (document: TextDocument) => {
    if (document.languageId !== 'greyscript') {
      return false;
    }

    return documentParseQueue.update(document);
  };
  const clear = (document: TextDocument) => {
    if (document.languageId !== 'greyscript') {
      return;
    }

    documentParseQueue.clear(document);
  };

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
