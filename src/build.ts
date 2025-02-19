import { BuildType, Transpiler } from 'greyscript-transpiler';
import vscode, {
  ExtensionContext,
  Uri
} from 'vscode';
import { greyscriptMeta } from 'greyscript-meta';

import { createParseResult } from './build/create-parse-result';
import { AgentType, executeImport } from './build/importer';
import { createInstaller } from './build/installer';
import { createBasePath } from './helper/create-base-path';
import { showCustomErrorMessage } from './helper/show-custom-error';
import { TranspilerResourceProvider } from './resource';
import documentManager from './helper/document-manager';
import { getIngameDirectory } from './helper/get-ingame-directory';
import { parseEnvVars } from './helper/parse-env-vars';

export function activate(context: ExtensionContext) {
  async function build(
    eventUri: Uri = vscode.window.activeTextEditor?.document?.uri
  ) {
    const parseResult = await documentManager.open(eventUri);

    if (parseResult === null) {
      vscode.window.showErrorMessage(
        'You cannot build a file which does not exist in the file system.',
        { modal: false }
      );
      return;
    }

    const dirtyFiles = await parseResult.getDirtyFiles(true);

    await Promise.all(dirtyFiles.map((it) => it.textDocument.save()))

    try {
      const config = vscode.workspace.getConfiguration('greybel');
      const targetUri = eventUri;
      const buildTypeFromConfig = config.get('transpiler.buildType');
      const environmentVariablesFromConfig =
        config.get<object>('transpiler.environmentVariables') || {};
      const excludedNamespacesFromConfig =
        config.get<string[]>('transpiler.excludedNamespaces') || [];
      const obfuscation = config.get<boolean>('transpiler.obfuscation');
      const ingameDirectory = await getIngameDirectory(config);
      let buildType = BuildType.DEFAULT;
      let buildOptions: any = {
        isDevMode: false
      };

      if (buildTypeFromConfig === 'Uglify') {
        buildType = BuildType.UGLIFY;
        buildOptions = {
          disableLiteralsOptimization: config.get('transpiler.dlo'),
          disableNamespacesOptimization: config.get('transpiler.dno'),
        };
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
        target: targetUri.toString(),
        resourceHandler: new TranspilerResourceProvider().getHandler(),
        buildType,
        buildOptions,
        environmentVariables: parseEnvVars(environmentVariablesFromConfig, true),
        obfuscation,
        excludedNamespaces: [
          'params',
          ...excludedNamespacesFromConfig,
          ...Array.from(Object.keys(greyscriptMeta.getTypeSignature('general').getDefinitions()))
        ],
        processImportPathCallback: (path: string) => {
          const relativePath = createBasePath(targetUri, path);
          return Uri.joinPath(ingameDirectory, relativePath).path;
        }
      }).parse();

      const rootPath = vscode.workspace.getWorkspaceFolder(targetUri);
      const rootPathUri = rootPath
        ? rootPath.uri
        : Uri.joinPath(eventUri, '..');
      const buildPath = Uri.joinPath(rootPathUri, './build');

      try {
        await vscode.workspace.fs.delete(buildPath, { recursive: true });
      } catch (err) {
        console.warn(err);
      }

      await vscode.workspace.fs.createDirectory(buildPath);
      await createParseResult(targetUri, buildPath, result);

      if (config.get<boolean>('transpiler.installer.active')) {
        const maxChars =
          config.get<number>('transpiler.installer.maxChars') || 160000;
        const autoCompile =
          config.get<boolean>('transpiler.installer.autoCompile') || false;
        const allowImport =
          config.get<boolean>('transpiler.installer.allowImport') || false;

        vscode.window.showInformationMessage('Creating installer.', {
          modal: false
        });
        await createInstaller({
          target: targetUri,
          autoCompile,
          buildPath: rootPathUri,
          ingameDirectory: ingameDirectory.path,
          result,
          maxChars,
          allowImport
        });
      }

      if (config.get<boolean>('createIngame.active')) {
        vscode.window.showInformationMessage('Importing files ingame.', {
          modal: false
        });

        await executeImport({
          target: targetUri,
          ingameDirectory: ingameDirectory.path,
          result,
          extensionContext: context,
          agentType: AgentType.C2Light,
          autoCompile: config
            .get<boolean>('createIngame.autoCompile'),
          allowImport: config
            .get<boolean>('createIngame.allowImport'),
        });
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
