import { workspace, ExtensionContext, Uri } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions
} from 'vscode-languageclient/lib/browser/main';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  const serverMain = Uri.joinPath(context.extensionUri, 'node_modules/greybel-languageserver-browser/index.js');
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

  try {
    await client.start();
  } catch (err) {
    console.log(err);
  }
}

export async function deactivate(): Promise<void> {
  if (!client) {
    return;
  }
  return await client.stop();
}