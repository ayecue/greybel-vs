import { workspace, ExtensionContext, Uri } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // The server is implemented in node
  const serverModule = Uri.joinPath(context.extensionUri, 'node_modules/greybel-languageserver/index.js');
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule.fsPath,
      transport: TransportKind.ipc
    },
    debug: {
      module: serverModule.fsPath,
      transport: TransportKind.ipc,
      options: {
        execArgv: ['--nolazy', '--inspect=6009']
      }
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'greyscript' }],
    synchronize: {
      configurationSection: 'greybel',
      fileEvents: workspace.createFileSystemWatcher('**/*')
    },
    diagnosticCollectionName: 'greyscript',
    middleware: {
      provideDocumentSemanticTokens: () => {
        return undefined;
      },
      provideFoldingRanges: () => {
        return undefined;
      }
    }
  };

  client = new LanguageClient(
    'greyscript-language-server',
    'GreyScript Language Server',
    serverOptions,
    clientOptions
  );

  client.registerProposedFeatures();
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}