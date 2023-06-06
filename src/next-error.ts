import { Parser } from 'greybel-core';
import { ASTRange } from 'greyscript-core';
import vscode, {
  ExtensionContext,
  Position,
  Range,
  TextEditor,
  TextEditorEdit
} from 'vscode';

export function activate(context: ExtensionContext) {
  function gotoNextError(
    editor: TextEditor,
    _edit: TextEditorEdit,
    _args: any[]
  ) {
    const selectedLine = (errRange: ASTRange) => {
      const range = new Range(
        new Position(errRange.start.line - 1, errRange.start.character - 1),
        new Position(errRange.end.line - 1, errRange.end.character - 1)
      );

      vscode.window.showTextDocument(editor.document, {
        selection: range
      });
    };

    try {
      const parser = new Parser(editor.document.getText());
      parser.parseChunk();
      vscode.window.showInformationMessage('all good :)', { modal: false });
    } catch (err: any) {
      if (err.range) {
        selectedLine(err.range);
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
