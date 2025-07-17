import { workspace, ExtensionContext, Uri } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions
} from 'vscode-languageclient/lib/browser/main';
import { GlobalFileSystemManager } from './helper/fs';

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
  const client = new LanguageClient(
    'greyscript-language-server',
    'GreyScript Language Server',
    clientOptions,
    worker
  );

  client.onRequest('custom/read-file', async (params: string) => {
    const { uri } = JSON.parse(params) as { uri: string };
    const uriInstance = Uri.parse(uri);
    const fileContent = await GlobalFileSystemManager.tryToDecode(uriInstance, true);
    return fileContent;
  });

  client.onRequest('custom/find-files', async (params: string) => {
    const { include, exclude } = JSON.parse(params) as { include: string, exclude?: string };
    const fileUris = await workspace.findFiles(include, exclude);
    return fileUris.map((uri) => uri.toString());
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