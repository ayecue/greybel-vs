const esbuild = require('esbuild');
const { polyfillNode } = require('esbuild-plugin-polyfill-node');
const globalsPlugin = require('esbuild-plugin-globals');
const dotenv = require('dotenv');
const envObj = dotenv.config().parsed;

const build = async () => {
  try {
    await esbuild
      .build({
        entryPoints: ['./out/extension-browser.js'],
        bundle: true,
        outfile: 'extension.browser.js',
        globalName: 'greyscript',
        sourcemap: false,
        minify: true,
        minifyWhitespace: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        target: 'ESNext',
        platform: 'browser',
        treeShaking: true,
        external: [
          'vscode',
          'greybel-languageserver'
        ],
        define: {
          'process.env.NODE_ENV': '"production"',
          ...Object.entries(envObj).reduce((result, [key, value]) => {
            result[`process.env.${key}`] = `"${value}"`;
            return result;
          }, {})
        },
        plugins: [
          polyfillNode({
            globals: false
          })
        ]
      });
  } catch (err) {
    console.error('Failed building project', { err });
    process.exit(1);
  }
};

build();
