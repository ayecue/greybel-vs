import vscode, { ExtensionContext, Uri } from 'vscode';
import { PrintOptions } from 'greybel-interpreter';
import { getContent } from './preview/generate-page';

class Preview {
  private context: ExtensionContext;
  private panel: vscode.WebviewPanel;

  constructor(context: ExtensionContext) {
    this.context = context;
    this.panel = null;
  }

  create() {
    if (this.panel) {
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'greyHackOutputPreview',
      'GreyHack Output Preview',
      {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true
      },
      {
        enableScripts: true,
        localResourceRoots: [Uri.file(this.context.extensionPath)],
        retainContextWhenHidden: true
      }
    );
  
    const indexScript = `${process.env.GREYBEL_TERMINAL_URL}/dist/view.js`;
    const dataResource = `${process.env.GREYBEL_TERMINAL_URL}/assets/preview.data`;
    const frameworkResource =  `${process.env.GREYBEL_TERMINAL_URL}/assets/preview.framework.js`;
    const loaderResource = `${process.env.GREYBEL_TERMINAL_URL}/assets/preview.loader.js`;
    const wasmResource = `${process.env.GREYBEL_TERMINAL_URL}/assets/preview.wasm`;
  
    panel.webview.html = getContent({
      indexScript,
      dataResource,
      frameworkResource,
      loaderResource,
      wasmResource
    });;

    this.panel = panel;

    panel.onDidDispose(() => {
      this.panel = null;
    });
  }

  print(message: string, { appendNewLine = true, replace = false }: Partial<PrintOptions> = {}) {
    this.panel?.webview.postMessage({
      type: 'print',
      message,
      appendNewLine,
      replace
    });
  }

  clear() {
    this.panel?.webview.postMessage({
      type: 'clear'
    });
  }

  write(message: string) {
    this.panel?.webview.postMessage({
      type: 'append-last',
      message
    });
  }

  updateLast(message: string) {
    this.panel?.webview.postMessage({
      type: 'update-last',
      message
    });
  }

  input(message: string) {
    this.panel?.webview.postMessage({
      type: 'input',
      message
    });
  }
}

let previewInstance: Preview = null;

export function getPreviewInstance() {
  return previewInstance;
}

export function setPreviewInstance(instance: Preview) {
  previewInstance = instance;
} 

export function activate(context: ExtensionContext) {
  setPreviewInstance(new Preview(context));

  context.subscriptions.push(
    vscode.commands.registerCommand('greybel.preview', () =>
      getPreviewInstance().create() 
    )
  );
}
