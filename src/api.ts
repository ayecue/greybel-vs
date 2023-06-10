import vscode, {
  ExtensionContext,
  TextEditor,
  TextEditorEdit,
  Uri
} from 'vscode';

export function activate(context: ExtensionContext) {
  async function api(_editor: TextEditor, _edit: TextEditorEdit, _args: any[]) {
    const panel = vscode.window.createWebviewPanel(
      'greyScriptAPI',
      'GreyScript API',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [Uri.file(context.extensionPath)]
      }
    );

    const indexStylesheet = Uri.file(
      Uri.joinPath(Uri.file(context.extensionPath), 'api.view.css').fsPath
    );
    const indexScript = Uri.file(
      Uri.joinPath(Uri.file(context.extensionPath), 'api.view.js').fsPath
    );

    panel.webview.html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
          <meta http-equiv="content-type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;">
          <title>GreyScript API</title>
          <link defer href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
          <link defer rel="stylesheet" type="text/css" href="${panel.webview.asWebviewUri(
            indexStylesheet
          )}">
          <link defer rel="stylesheet" type="text/css" href="https://unpkg.com/prismjs@1.29.0/themes/prism-twilight.min.css">
          <script defer crossorigin src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
          <script defer crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
          <script defer crossorigin src="https://unpkg.com/react-in-viewport@1.0.0-alpha.30/dist/umd/index.js"></script>
          <script defer crossorigin src="https://unpkg.com/react-markdown@8.0.7/react-markdown.min.js"></script>
          <script defer crossorigin src="https://unpkg.com/prismjs@1.29.0/prism.js"></script>
      </head>
      <body>
        <div id="root">
          
        </div>
        <footer>
          <script defer src="${panel.webview.asWebviewUri(
            indexScript
          )}"></script>
        </footer>
      </body>
    </html>`;
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.api', api)
  );
}
