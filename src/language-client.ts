import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { LanguageId } from 'greybel-languageserver/dist/types';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join('node_modules', 'greybel-languageserver', 'dist', 'node.js')
  );

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        execArgv: ['--nolazy', '--inspect=6009']
      }
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: LanguageId }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*')
    },
    diagnosticCollectionName: LanguageId
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