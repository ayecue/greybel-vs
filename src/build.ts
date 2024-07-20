import { BuildType, Transpiler } from 'greyscript-transpiler';
import vscode, {
  ExtensionContext,
  Uri
} from 'vscode';
import { greyscriptMeta } from 'greyscript-meta';

import { createParseResult } from './build/create-parse-result';
import { AgentType, ImportResultFailure, ImportResultSuccess, ImporterMode, createImporter } from './build/importer';
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

    const dirtyFiles = await result.getDirtyFiles(true);

    await Promise.all(dirtyFiles.map((it) => it.textDocument.save()))

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
      let buildOptions: any = {
        isDevMode: false
      };

      if (buildTypeFromConfig === 'Uglify') {
        buildType = BuildType.UGLIFY;
      } else if (buildTypeFromConfig === 'Beautify') {
        buildType = BuildType.BEAUTIFY;
        buildOptions = {
          isDevMode: false,
          keepParentheses: config.get<boolean>('transpiler.beautify.keepParentheses'),
          indentation: config.get<string>('transpiler.beautify.indentation') === 'Tab' ? 0 : 1,
          indentationSpaces: config.get<number>('transpiler.beautify.indentationSpaces')
        };
      }

      const result = await new Transpiler({
        target,
        resourceHandler: new TranspilerResourceProvider().getHandler(),
        buildType,
        buildOptions,
        environmentVariables: new Map(
          Object.entries(environmentVariablesFromConfig)
        ),
        obfuscation,
        disableLiteralsOptimization: config.get('transpiler.dlo'),
        disableNamespacesOptimization: config.get('transpiler.dno'),
        excludedNamespaces: [
          'params',
          ...excludedNamespacesFromConfig,
          ...Array.from(Object.keys(greyscriptMeta.getTypeSignature('general').getDefinitions()))
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

      if (config.get<boolean>('transpiler.installer.active')) {
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
          ingameDirectory: ingameDirectory.path,
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
          ingameDirectory: ingameDirectory.path,
          result,
          extensionContext: context,
          mode: config
            .get<ImporterMode>('createIngame.mode'),
          agentType: config
            .get<AgentType>('createIngame.agent'),
          autoCompile: config
            .get<boolean>('createIngame.autoCompile'),
        });
        const successfulItems = importResults.filter((item) => item.success) as ImportResultSuccess[];
        const failedItems = importResults.filter((item) => !item.success) as ImportResultFailure[];

        if (successfulItems.length === 0) {
          vscode.window.showInformationMessage(`File import failed! This can happen if Grey Hack received an update and sometimes due to other issues.`, {
            modal: true,
            detail: failedItems.map((it) => it.reason).join('\n')
          });
        } else if (failedItems.length > 0) {
          vscode.window.showInformationMessage(`Import was only partially successful. Only ${successfulItems.length} files got imported to ${ingameDirectory.fsPath}!`, {
            modal: true,
            detail: failedItems.map((it) => it.reason).join('\n')
          });
        } else {
          vscode.window.showInformationMessage(`${successfulItems.length} files got imported to ${ingameDirectory.fsPath}!`, {
            modal: false
          });
        }
      }

      vscode.window.showInformationMessage(
        `Build done. Available [here](${buildPath.toString()}).`,
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
