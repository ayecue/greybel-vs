import { ASTRange } from 'miniscript-core';
import vscode, {
  Diagnostic,
  ExtensionContext,
  Position,
  Range,
  TextDocument
} from 'vscode';

import documentParseQueue from './helper/document-manager';

function lookupErrors(document: TextDocument): Diagnostic[] {
  const errors = documentParseQueue.get(document).errors;

  return errors.map((err: any) => {
    // Lexer error and Parser error
    if (err?.range) {
      const range: ASTRange = err.range;
      return new Diagnostic(
        new Range(
          new Position(range.start.line - 1, range.start.character - 1),
          new Position(range.end.line - 1, range.end.character - 1)
        ),
        err.message,
        vscode.DiagnosticSeverity.Error
      );
    }

    const firstLine = document.lineAt(0);
    const lastLine = document.lineAt(document.lineCount - 1);

    return new Diagnostic(
      new Range(firstLine.range.start, lastLine.range.end),
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
