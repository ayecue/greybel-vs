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
  
    const indexScript = Uri.joinPath(Uri.file(this.context.extensionPath), 'preview.view.js');
    const dataResource = Uri.joinPath(Uri.file(this.context.extensionPath), 'preview/preview.data');
    const frameworkResource =  Uri.joinPath(Uri.file(this.context.extensionPath), 'preview/preview.framework.js');
    const loaderResource = Uri.joinPath(Uri.file(this.context.extensionPath), 'preview/preview.loader.js');
    const wasmResource = Uri.joinPath(Uri.file(this.context.extensionPath), 'preview/preview.wasm');
  
    panel.webview.html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
          <meta http-equiv="content-type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;">
          <title>GreyHack Output Preview</title>
      </head>
      <body>
        <canvas id="unity-canvas" width="100%" height="100%" tabindex="-1" style="width: 960px; height: 600px; background: #231F20"></canvas>
        <script src="${panel.webview.asWebviewUri(indexScript)}"></script>
        <script src="${panel.webview.asWebviewUri(loaderResource)}"></script>
        <script>
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // Mobile device style: fill the whole browser client area with the game canvas:
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
            document.getElementsByTagName('head')[0].appendChild(meta);

            var canvas = document.querySelector("#unity-canvas");
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.position = "fixed";

            document.body.style.textAlign = "left";
          }

          createUnityInstance(document.querySelector("#unity-canvas"), {
            dataUrl: "${panel.webview.asWebviewUri(dataResource)}",
            frameworkUrl: "${panel.webview.asWebviewUri(frameworkResource)}",
            codeUrl: "${panel.webview.asWebviewUri(wasmResource)}",
            streamingAssetsUrl: "StreamingAssets",
            companyName: "None",
            productName: "TerminalPreview",
            productVersion: "1.0",
            matchWebGLToCanvasSize: true, // Uncomment this to separately control WebGL canvas render size and DOM element size.
            devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displaysö
          }).then(onUnityInstanceLoad).catch((err) => alert(err.message));
        </script>
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
