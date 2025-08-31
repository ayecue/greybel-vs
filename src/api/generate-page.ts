import { Uri, WebviewPanel } from 'vscode';

export interface ContentOptions {
  panel: WebviewPanel;
  indexScript: Uri;
  indexStylesheet: Uri;
  searchText: string;
}

export function getContent({
  panel,
  indexScript,
  indexStylesheet,
  searchText
}: ContentOptions): string {
  return `<!DOCTYPE html>
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
        <script defer crossorigin src="https://unpkg.com/react-markdown@8.0.7/react-markdown.min.js"></script>
        <script defer crossorigin src="https://unpkg.com/prismjs@1.29.0/prism.js"></script>
    </head>
    <body>
      <div id="root">
        
      </div>
      <footer>
        <script>var filterInit = "${searchText.replace('"', '\\"')}";</script>
        <script defer src="${panel.webview.asWebviewUri(indexScript)}"></script>
      </footer>
    </body>
  </html>`;
}
