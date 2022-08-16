import vscode, {
  Diagnostic,
  ExtensionContext,
  TextDocument,
  TextDocumentChangeEvent
} from 'vscode';

import {
  clearDocumentAST,
  createDocumentAST,
  getLastDocumentASTErrors
} from './helper/document-manager';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function lookupErrors(document: TextDocument): Diagnostic[] {
  const errors = getLastDocumentASTErrors(document);

  return errors.map((err: any) => {
    let line = -1;

    if (hasOwnProperty.call(err, 'line')) {
      line = err.line;
    } else if (hasOwnProperty.call(err, 'token')) {
      line = err.token.line;
    }

    return new Diagnostic(
      document.lineAt(line - 1).range,
      err.message,
      vscode.DiagnosticSeverity.Error
    );
  });
}

export function activate(context: ExtensionContext) {
  const collection = vscode.languages.createDiagnosticCollection('greyscript');

  function updateDiagnosticCollection(document: TextDocument) {
    createDocumentAST(document);
    const err = lookupErrors(document);
    collection.set(document.uri, err);
  }

  function clearDiagnosticCollection(document: TextDocument) {
    clearDocumentAST(document);
    collection.delete(document.uri);
  }

  context.subscriptions.push(
    collection,
    vscode.workspace.onDidOpenTextDocument(updateDiagnosticCollection),
    vscode.workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        updateDiagnosticCollection(event.document);
      }
    ),
    vscode.workspace.onDidSaveTextDocument(updateDiagnosticCollection),
    vscode.workspace.onDidCloseTextDocument(clearDiagnosticCollection)
  );
}
