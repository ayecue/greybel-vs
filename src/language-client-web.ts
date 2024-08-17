import { workspace, ExtensionContext, Uri } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions
} from 'vscode-languageclient/lib/browser/main';
import { tryToDecode } from './helper/fs';

let client: LanguageClient;

function createWorker(context: ExtensionContext): Worker {
  const serverMain = Uri.joinPath(context.extensionUri, 'node_modules/greybel-languageserver-browser/index.js');
  const worker = new Worker(serverMain.toString(true));

  return worker;
}

function createClient(context: ExtensionContext, worker: Worker) {
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'greyscript' }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*')
    },
    diagnosticCollectionName: 'greyscript'
  };
  const client = new LanguageClient(
    'greyscript-language-server',
    'GreyScript Language Server',
    clientOptions,
    worker
  );

  client.onRequest('custom/read-file', async (filePath: string) => {
    const uri = Uri.parse(filePath);
    const fileContent = await tryToDecode(uri);
    return fileContent;
  });

  return client;
}

export async function activate(context: ExtensionContext) {
  const worker = createWorker(context);

  client = createClient(context, worker);

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