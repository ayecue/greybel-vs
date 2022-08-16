import { Transpiler } from 'greybel-transpiler';
import vscode, {
  ExtensionContext,
  Range,
  TextEditor,
  TextEditorEdit
} from 'vscode';

import { TranspilerResourceProvider } from './resource';

export function activate(context: ExtensionContext) {
  async function minify(
    editor: TextEditor,
    _edit: TextEditorEdit,
    _args: any[]
  ) {
    if (editor.document.isDirty) {
      const isSaved = await editor.document.save();

      if (!isSaved) {
        vscode.window.showErrorMessage(
          'You cannot minify a file which does not exist in the file system.',
          { modal: false }
        );
        return;
      }
    }

    try {
      const config = vscode.workspace.getConfiguration('greybel');
      const result = await new Transpiler({
        target: editor.document.fileName,
        resourceHandler: new TranspilerResourceProvider().getHandler(),
        uglify: config.get('transpiler.uglify'),
        disableLiteralsOptimization: config.get('transpiler.dlo'),
        disableNamespacesOptimization: config.get('transpiler.dno')
      }).parse();

      const firstLine = editor.document.lineAt(0);
      const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const textRange = new Range(firstLine.range.start, lastLine.range.end);

      editor.edit(function (editBuilder: TextEditorEdit) {
        editBuilder.replace(textRange, result[editor.document.fileName]);
      });

      vscode.window.showInformationMessage('Minifying done.', { modal: false });
    } catch (err: any) {
      vscode.window.showErrorMessage(err.message, { modal: false });
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.minify', minify)
  );
}
