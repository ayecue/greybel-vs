import { BuildType, Transpiler } from 'greyscript-transpiler';
import vscode, {
  ExtensionContext,
  Uri
} from 'vscode';
import { greyscriptMeta } from 'greyscript-meta/dist/meta';

import { createParseResult } from './build/create-parse-result';
import { AgentType, ImporterMode, createImporter } from './build/importer';
import { createInstaller } from './build/installer';
import { createBasePath } from './helper/create-base-path';
import { showCustomErrorMessage } from './helper/show-custom-error';
import { TranspilerResourceProvider } from './resource';
import documentManager from './helper/document-manager';

export function activate(context: ExtensionContext) {
  async function build(
    eventUri: Uri = vscode.window.activeTextEditor?.document?.uri
  ) {
    const result = await documentManager.open(eventUri.fsPath);

    if (result === null) {
      vscode.window.showErrorMessage(
        'You cannot build a file which does not exist in the file system.',
        { modal: false }
      );
      return;
    }

    if (result.textDocument.isDirty) {
      await result.textDocument.save();
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
        excludedNamespaces: [
          'params',
          ...excludedNamespacesFromConfig,
          ...Array.from(Object.keys(greyscriptMeta.getSignaturesByType('general')))
        ],
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

      if (config.get<boolean>('installer.installer.active')) {
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

        const importResults = await createImporter({
          target,
          ingameDirectory: ingameDirectory.path.replace(/\/$/i, ''),
          result,
          extensionContext: context,
          mode: vscode.workspace
            .getConfiguration('greybel')
            .get<ImporterMode>('createIngame.mode'),
          agentType: vscode.workspace
            .getConfiguration('greybel')
            .get<AgentType>('createIngame.agent')
        });
        const successfulItems = importResults.filter((item) => item.success);
        const failedItems = importResults.filter((item) => !item.success);

        if (successfulItems.length === 0) {
          vscode.window.showInformationMessage(`No files could get imported! This might be due to a new Grey Hack version or other reasons.`, {
            modal: false
          });
        } else if (failedItems.length > 0) {
          vscode.window.showInformationMessage(`Import was only partially successful. Only ${successfulItems.length} files got imported to ${ingameDirectory.fsPath}!`, {
            modal: false
          });
        } else {
          vscode.window.showInformationMessage(`${successfulItems.length} files got imported to ${ingameDirectory.fsPath}!`, {
            modal: false
          });
        }
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
    vscode.commands.registerCommand('greybel.build', build)
  );
}
