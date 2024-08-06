import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions
} from 'vscode-languageclient/browser';
import { LanguageId } from 'greybel-languageserver/dist/types';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    path.join('node_modules', 'greybel-languageserver', 'dist', 'browser.js')
  );
  const worker = new Worker(serverModule);

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
    clientOptions,
    worker
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