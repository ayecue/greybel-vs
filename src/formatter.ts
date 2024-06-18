import { BuildType } from 'greybel-transpiler';
import { DirectTranspiler } from 'greyscript-transpiler';
import vscode, {
  ExtensionContext,
  Range
} from 'vscode';

export function activate(context: ExtensionContext) {
  function tryFormat(content: string): string | null {
    try {
      return new DirectTranspiler({
        code: content,
        buildType: BuildType.BEAUTIFY
      }).parse();
    } catch (err) {
      return null;
    }
  }

  vscode.languages.registerDocumentFormattingEditProvider('greyscript', {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
      const result = tryFormat(document.getText());

      if (result === null) {
        return [];
      }

      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(
        document.lineCount - 1
      );
      const textRange = new Range(
        firstLine.range.start,
        lastLine.range.end
      );

      return [vscode.TextEdit.replace(textRange, result)];
    }
  });
}
