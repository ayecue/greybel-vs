export interface ContentOptions {
  indexScript: string;
  dataResource: string;
  frameworkResource: string;
  loaderResource: string;
  wasmResource: string;
}

export function getContent({
  indexScript,
  dataResource,
  frameworkResource,
  loaderResource,
  wasmResource
}: ContentOptions): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;">
        <title>GreyHack Output Preview</title>
    </head>
    <link defer href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
      .zoom-controls {
        position: absolute;
        bottom: 4px;
        right: 4px;
      }

      .zoom-controls a {
        display: inline-block;
        padding: 5px;
        margin: 0 5px 0 0;
        border-radius: 0.15em;
        box-sizing: border-box;
        text-decoration: none;
        text-transform: uppercase;
        font-weight: 400;
        color: #ffffff;
        background-color: #03b140;
        box-shadow: inset 0 -0.6em 0 -0.35em rgba(0, 0, 0, 0.17);
        text-align: center;
        position: relative;
        cursor: pointer;
        border: 1px solid transparent;
      }

      #zoom-in:before {
        content: "\\e8ff";
      }

      #zoom-out:before {
        content: "\\e900";
      }

    </style>
    <body>
      <div class="zoom-controls">
        <a href="#" id="zoom-in" class="material-icons" title="Zoom in"></a>
        <a href="#" id="zoom-out" class="material-icons" title="Zoom out"></a>
      </div>
      <canvas id="unity-canvas" width="100%" height="100%" tabindex="-1" style="width: 1280px; height: 800px; background: #231F20"></canvas>
      <script src="${indexScript}"></script>
      <script src="${loaderResource}"></script>
      <script>
        const zoomInButton = document.getElementById('zoom-in');
        const zoomOutButton = document.getElementById('zoom-out');
        const resolutions = [
          { width: 320, height: 200 },
          { width: 640, height: 400 },
          { width: 1280, height: 800 }
        ];
        let currentResolutionIndex = 2;

        function setResolution(index) {
          if (index < 0 || index >= resolutions.length) {
            return false;
          }

          const canvas = document.getElementById('unity-canvas');
          const resolution = resolutions[index];
          canvas.width = resolution.width;
          canvas.height = resolution.height;
          canvas.style.width = resolution.width + 'px';
          canvas.style.height = resolution.height + 'px';
          currentResolutionIndex = index;

          return true;
        }

        zoomInButton.addEventListener('click', (e) => {
          e.preventDefault();
          setResolution(currentResolutionIndex + 1)
        });

        zoomOutButton.addEventListener('click', (e) => {
          e.preventDefault();
          setResolution(currentResolutionIndex - 1)
        });

        createUnityInstance(document.querySelector("#unity-canvas"), {
          dataUrl: "${dataResource}",
          frameworkUrl: "${frameworkResource}",
          codeUrl: "${wasmResource}",
          streamingAssetsUrl: "StreamingAssets",
          companyName: "None",
          productName: "TerminalPreview",
          productVersion: "1.0",
          matchWebGLToCanvasSize: true, // Uncomment this to separately control WebGL canvas render size and DOM element size.
          devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displays
        }).then(onUnityInstanceLoad).catch((err) => alert(err.message));
      </script>
    </body>
  </html>`;
}