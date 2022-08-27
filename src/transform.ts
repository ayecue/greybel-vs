import { BuildType, DirectTranspiler } from 'greybel-transpiler';
import vscode, {
  ExtensionContext,
  Range,
  TextEditor,
  TextEditorEdit
} from 'vscode';

import { TranspilerResourceProvider } from './resource';

export function activate(context: ExtensionContext) {
  async function transform(
    editor: TextEditor,
    _edit: TextEditorEdit,
    _args: any[],
    specificBuildType?: BuildType
  ) {
    if (editor.document.isDirty) {
      const isSaved = await editor.document.save();

      if (!isSaved) {
        vscode.window.showErrorMessage(
          'You cannot transform a file which does not exist in the file system.',
          { modal: false }
        );
        return;
      }
    }

    try {
      const config = vscode.workspace.getConfiguration('greybel');
      const buildTypeFromConfig = config.get('transpiler.buildType');
      const environmentVariablesFromConfig =
        config.get<object>('transpiler.environmentVariables') || {};
      const excludedNamespacesFromConfig =
        config.get<string[]>('transpiler.excludedNamespaces') || [];
      let buildType = BuildType.DEFAULT;

      if (buildTypeFromConfig === 'Uglify') {
        buildType = BuildType.UGLIFY;
      } else if (buildTypeFromConfig === 'Beautify') {
        buildType = BuildType.BEAUTIFY;
      }

      const result = new DirectTranspiler({
        code: editor.document.getText(),
        buildType: specificBuildType || buildType,
        environmentVariables: new Map(
          Object.entries(environmentVariablesFromConfig)
        ),
        disableLiteralsOptimization: config.get('transpiler.dlo'),
        disableNamespacesOptimization: config.get('transpiler.dno'),
        excludedNamespaces: excludedNamespacesFromConfig
      }).parse();

      const firstLine = editor.document.lineAt(0);
      const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const textRange = new Range(firstLine.range.start, lastLine.range.end);

      editor.edit(function (editBuilder: TextEditorEdit) {
        editBuilder.replace(textRange, result);
      });

      vscode.window.showInformationMessage('Transform done.', { modal: false });
    } catch (err: any) {
      vscode.window.showErrorMessage(err.message, { modal: false });
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.transform', transform),
    vscode.commands.registerTextEditorCommand(
      'greybel.minify',
      (editor: TextEditor, edit: TextEditorEdit, args: any[]) =>
        transform(editor, edit, args, BuildType.UGLIFY)
    ),
    vscode.commands.registerTextEditorCommand(
      'greybel.beautify',
      (editor: TextEditor, edit: TextEditorEdit, args: any[]) =>
        transform(editor, edit, args, BuildType.BEAUTIFY)
    )
  );
}
