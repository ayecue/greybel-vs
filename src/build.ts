import { BuildType, Transpiler } from 'greyscript-transpiler';
import vscode, {
  ExtensionContext,
  Uri
} from 'vscode';
import { greyscriptMeta } from 'greyscript-meta';

import { createParseResult } from './build/create-parse-result';
import { executeImport } from './build/importer';
import { createInstaller } from './build/installer';
import { createBasePath } from './helper/create-base-path';
import { showCustomErrorMessage } from './helper/show-custom-error';
import { TranspilerResourceProvider } from './resource';
import documentManager from './helper/document-manager';
import { getIngameDirectory } from './helper/get-ingame-directory';
import { VersionManager } from './helper/version-manager';
import { EnvironmentVariablesManager } from './helper/env-mapper';
import { Watcher } from './helper/watcher';
import { getBuildOutputUri, getBuildRootUri, getBuildTargetUri } from './helper/build-uri';
import { randomString } from './helper/random-string';

export function activate(context: ExtensionContext) {
  async function build(
    targetUri: Uri
  ) {
    const parseResult = await documentManager.open(targetUri);

    if (parseResult === null) {
      vscode.window.showErrorMessage(
        'You cannot build a file which does not exist in the file system.',
        { modal: false }
      );
      return;
    }

    const dirtyFiles = await parseResult.getDirtyFiles(true);

    await Promise.all(dirtyFiles.map((it) => it.textDocument.save()));

    try {
      const config = vscode.workspace.getConfiguration('greybel');
      const buildTypeFromConfig = config.get<string>('transpiler.buildType');
      const environmentVariablesFromConfig =
        config.get<object>('transpiler.environmentVariables') || {};
      const environmentFilepath = config.get<string>('transpiler.environmentFile');
      const excludedNamespacesFromConfig =
        config.get<string[]>('transpiler.excludedNamespaces') || [];
      const obfuscation = config.get<boolean>('transpiler.obfuscation');
      const outputFilename = config.get<string>('transpiler.outputFilename');
      const autoCompile = config.get<boolean>('greybel.autoCompile') ?? true;
      const ingameDirectory = await getIngameDirectory(config);
      const resourceDirectory = Uri.joinPath(ingameDirectory, randomString(5));
      const fileImportRootPath = autoCompile ? resourceDirectory : ingameDirectory;
      const envMapper = new EnvironmentVariablesManager();
      let outputUri = targetUri;
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

      if (outputFilename != null && outputFilename != '') {
        outputUri = Uri.joinPath(Uri.joinPath(targetUri, '..'), outputFilename);
      }

      envMapper.injectFromJSON(environmentVariablesFromConfig, true);
      await envMapper.injectFromWorkspace(targetUri, environmentFilepath);

      const result = await new Transpiler({
        target: targetUri.toString(),
        resourceHandler: new TranspilerResourceProvider().getHandler(),
        buildType,
        buildOptions,
        environmentVariables: envMapper.toMap(),
        obfuscation,
        excludedNamespaces: [
          'params',
          ...excludedNamespacesFromConfig,
          ...Array.from(Object.keys(greyscriptMeta.getTypeSignature('general').getDefinitions()))
        ],
        processImportPathCallback: (path: string) => {
          const relativePath = createBasePath(outputUri, path);
          return Uri.joinPath(fileImportRootPath, relativePath).path;
        }
      }).parse();

      // Remove the main file from the result and replace with the output file
      const mainContent = result[targetUri.toString()];
      delete result[targetUri.toString()];
      result[outputUri.toString()] = mainContent;

      const rootPathUri = getBuildRootUri(outputUri);
      const buildPath = getBuildOutputUri(rootPathUri);

      try {
        await vscode.workspace.fs.delete(buildPath, { recursive: true });
      } catch (err) {
        console.warn(err);
      }

      await vscode.workspace.fs.createDirectory(buildPath);
      await createParseResult(outputUri, buildPath, result);

      if (config.get<boolean>('transpiler.installer.active')) {
        const maxChars =
          config.get<number>('transpiler.installer.maxChars') || 160000;
        const allowImport =
          config.get<boolean>('transpiler.installer.allowImport') || false;

        vscode.window.showInformationMessage('Creating installer.', {
          modal: false
        });
        await createInstaller({
          target: outputUri,
          autoCompile,
          buildPath: rootPathUri,
          ingameDirectory: ingameDirectory.path,
          resourceDirectory: resourceDirectory.path,
          result,
          maxChars,
          allowImport
        });
      }

      if (config.get<boolean>('createIngame.active')) {
        const port = config.get<number>('createIngame.port');

        vscode.window.showInformationMessage('Importing files ingame.', {
          modal: false
        });

        await executeImport({
          target: outputUri,
          ingameDirectory: ingameDirectory.path,
          resourceDirectory: resourceDirectory.path,
          result,
          extensionContext: context,
          port,
          autoCompile,
          allowImport: config
            .get<boolean>('createIngame.allowImport'),
        });

        VersionManager.triggerContextAgentHealthcheck(port);
      }

      vscode.window.showInformationMessage(
        `Build done. Available [here](${buildPath.toString()}).`,
        { modal: false }
      );
    } catch (err: any) {
      showCustomErrorMessage(err);
    }
  }

  async function buildRootFile(eventUri: Uri = vscode.window.activeTextEditor?.document?.uri) {
    const config = vscode.workspace.getConfiguration('greybel');
    const targetUri = getBuildTargetUri(config.get<string>('rootFile'), eventUri);

    if (targetUri === null) {
      vscode.window.showErrorMessage(
        'Invalid target uri.',
        { modal: false }
      );
      return;
    }

    await build(targetUri);
  }

  async function buildFileFromContext(eventUri: Uri = vscode.window.activeTextEditor?.document?.uri) {
    await build(eventUri);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('greybel.buildFileFromContext', buildFileFromContext),
    vscode.commands.registerCommand('greybel.buildRootFile', buildRootFile),
    new Watcher(buildRootFile).start()
  );
}
