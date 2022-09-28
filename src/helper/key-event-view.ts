import { KeyEvent } from 'greybel-interpreter';
import vscode from 'vscode';

export type KeyPressCallback = (keyEvent: KeyEvent) => void;

export default function (callback: KeyPressCallback) {
  const panel = vscode.window.createWebviewPanel(
    'greyscriptInput',
    'GreyScript Input',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true
    }
  );
  let called = false;

  panel.webview.html = `<!DOCTYPE html>
  <html style="height: 100%;width: 100%;">
    <head>
      <meta charset="utf-8">
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;">
        <title>GreyScript Input Recorder</title>
    </head>
    <body style="height: 100%;width: 100%;background:#000;text-align:center;display:flex;align-items:center;justify-content:center;">
      <div style="vertical-align:middle;display: inline;color:#FFF;">
        Press any button...
      </div>
      <footer>
        <script>
          (function() {
            const vscode = acquireVsCodeApi();

            document.addEventListener('keydown', (e) => {
              vscode.postMessage({
                command: 'press',
                text: JSON.stringify({
                  keyCode: e.keyCode,
                  code: e.code
                })
              });
            });
          }());
        </script>
      </footer>
    </body>
  </html>`;

  panel.webview.onDidReceiveMessage((event: any) => {
    called = true;

    const data = JSON.parse(event.text);

    callback({
      keyCode: data.keyCode,
      code: data.code
    });

    panel.dispose();
  });

  panel.onDidDispose(() => {
    if (!called) {
      callback({
        keyCode: 13,
        code: 'Enter'
      });
    }
  });
}
