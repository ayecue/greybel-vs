import vscode, {
    Diagnostic,
    ExtensionContext,
    TextDocument,
    TextDocumentChangeEvent
  } from 'vscode';
  
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
  