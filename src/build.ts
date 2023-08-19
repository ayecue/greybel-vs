import { BuildType, Transpiler } from 'greybel-transpiler';
import vscode, {
  ExtensionContext,
  TextEditor,
  TextEditorEdit,
  Uri
} from 'vscode';

import { createParseResult } from './build/create-parse-result';
import { createImporter } from './build/importer';
import { createInstaller } from './build/installer';
import { createBasePath } from './helper/create-base-path';
import { showCustomErrorMessage } from './helper/show-custom-error';
import { TranspilerResourceProvider } from './resource';

export function activate(context: ExtensionContext) {
  async function build(
    editor: TextEditor,
    _edit: TextEditorEdit,
    eventUri: Uri
  ) {
    if (
      editor.document.uri.fsPath === eventUri.fsPath &&
      editor.document.isDirty
    ) {
      const isSaved = await editor.document.save();

      if (!isSaved) {
        vscode.window.showErrorMessage(
          'You cannot build a file which does not exist in the file system.',
          { modal: false }
        );
        return;
      }
    }

    try {
      const config = vscode.workspace.getConfiguration('greybel');
      const target = eventUri.fsPath;
      const buildTypeFromConfig = config.get('transpiler.buildType');
      const environmentVariablesFromConfig =
        config.get<object>('transpiler.environmentVariables') || {};
      const excludedNamespacesFromConfig =
        config.get<string[]>('transpiler.excludedNamespaces') || [];
      const obfuscation = config.get<boolean>('transpiler.obfuscation');
      const ingameDirectory = Uri.file(
        config.get<string>('transpiler.ingameDirectory')
      );
      let buildType = BuildType.DEFAULT;

      if (buildTypeFromConfig === 'Uglify') {
        buildType = BuildType.UGLIFY;
      } else if (buildTypeFromConfig === 'Beautify') {
        buildType = BuildType.BEAUTIFY;
      }

      const result = await new Transpiler({
        target,
        resourceHandler: new TranspilerResourceProvider().getHandler(),
        buildType,
        environmentVariables: new Map(
          Object.entries(environmentVariablesFromConfig)
        ),
        obfuscation,
        disableLiteralsOptimization: config.get('transpiler.dlo'),
        disableNamespacesOptimization: config.get('transpiler.dno'),
        excludedNamespaces: excludedNamespacesFromConfig,
        processImportPathCallback: (path: string) => {
          const relativePath = createBasePath(target, path);
          return Uri.joinPath(ingameDirectory, relativePath).path;
        }
      }).parse();

      const rootPath = vscode.workspace.rootPath
        ? Uri.file(vscode.workspace.rootPath)
        : Uri.joinPath(Uri.file(eventUri.fsPath), '..');
      const buildPath = Uri.joinPath(rootPath, './build');

      try {
        await vscode.workspace.fs.delete(buildPath, { recursive: true });
      } catch (err) {
        console.warn(err);
      }

      await vscode.workspace.fs.createDirectory(buildPath);
      await createParseResult(target, buildPath, result);

      if (config.get<boolean>('installer')) {
        const maxChars =
          config.get<number>('transpiler.installer.maxChars') || 160000;
        const autoCompile =
          config.get<boolean>('transpiler.installer.autoCompile') || false;

        vscode.window.showInformationMessage('Creating installer.', {
          modal: false
        });
        await createInstaller({
          target,
          autoCompile,
          buildPath: rootPath,
          ingameDirectory: ingameDirectory.path.replace(/\/$/i, ''),
          result,
          maxChars
        });
      }

      if (config.get<boolean>('createIngame.active')) {
        vscode.window.showInformationMessage('Importing files ingame.', {
          modal: false
        });

        await createImporter({
          target,
          ingameDirectory: ingameDirectory.path.replace(/\/$/i, ''),
          result,
          extensionContext: context
        });
      }

      vscode.window.showInformationMessage(
        `Build done. Available [here](${buildPath.toString(true)}).`,
        { modal: false }
      );
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.build', build)
  );
}
