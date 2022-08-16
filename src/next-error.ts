import { Parser } from 'greybel-core';
import vscode, {
  ExtensionContext,
  Position,
  Range,
  TextEditor,
  TextEditorEdit
} from 'vscode';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function activate(context: ExtensionContext) {
  function gotoNextError(
    editor: TextEditor,
    _edit: TextEditorEdit,
    _args: any[]
  ) {
    const selectedLine = (line: number) => {
      const eol = editor.document.lineAt(line - 1).text.length;
      const start = new Position(line - 1, 0);
      const end = new Position(line - 1, eol);
      const range = new Range(start, end);

      vscode.window.showTextDocument(editor.document, {
        selection: range
      });
    };

    try {
      const parser = new Parser(editor.document.getText());
      parser.parseChunk();
      vscode.window.showInformationMessage('all good :)', { modal: false });
    } catch (err: any) {
      if (hasOwnProperty.call(err, 'line')) {
        selectedLine(err.line);
      } else if (hasOwnProperty.call(err, 'token')) {
        selectedLine(err.token.line);
      }

      vscode.window.showErrorMessage(err.message, { modal: false });
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'greybel.gotoError',
      gotoNextError
    )
  );
}
