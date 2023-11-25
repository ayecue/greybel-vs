import vscode, { ExtensionContext, Uri } from 'vscode';
import { PrintOptions } from 'greybel-interpreter';

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
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [Uri.file(this.context.extensionPath)]
      }
    );
  
    const indexStylesheet = Uri.file(
      Uri.joinPath(Uri.file(this.context.extensionPath), 'preview.view.css').fsPath
    );
    const indexScript = Uri.file(
      Uri.joinPath(Uri.file(this.context.extensionPath), 'preview.view.js').fsPath
    );
  
    panel.webview.html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
          <meta http-equiv="content-type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;">
          <title>GreyHack Output Preview</title>
          <link defer rel="stylesheet" type="text/css" href="${panel.webview.asWebviewUri(
            indexStylesheet
          )}">
      </head>
      <body>
        <div id="root">
          <div id="preview"></div>
        </div>
        <footer>
          <script defer src="${panel.webview.asWebviewUri(indexScript)}"></script>
        </footer>
      </body>
    </html>`;

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
      type: 'write',
      message
    });
  }

  updateLast(message: string) {
    this.panel?.webview.postMessage({
      type: 'update-last',
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
    vscode.commands.registerTextEditorCommand('greybel.preview', () =>
      getPreviewInstance().create() 
    )
  );
}
