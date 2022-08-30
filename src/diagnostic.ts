import vscode, { Diagnostic, ExtensionContext, TextDocument } from 'vscode';

import documentParseQueue from './helper/document-manager';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function lookupErrors(document: TextDocument): Diagnostic[] {
  const errors = documentParseQueue.get(document).errors;

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

  documentParseQueue.on('parsed', (document: TextDocument) => {
    const err = lookupErrors(document);
    collection.set(document.uri, err);
  });

  documentParseQueue.on('cleared', (document: TextDocument) => {
    collection.delete(document.uri);
  });

  context.subscriptions.push(collection);
}
