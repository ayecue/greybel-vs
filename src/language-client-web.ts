import { workspace, ExtensionContext, Uri } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions
} from 'vscode-languageclient/browser';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverMain = Uri.joinPath(context.extensionUri, 'node_modules/greybel-languageserver/browser.js');
  const worker = new Worker(serverMain.toString(true));

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'greyscript' }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*')
    },
    diagnosticCollectionName: 'greyscript'
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