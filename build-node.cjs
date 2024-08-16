const esbuild = require('esbuild');
const dotenv = require('dotenv');
const envObj = dotenv.config().parsed;

const build = async () => {
  try {
    await esbuild
      .build({
        entryPoints: ['./out/extension.js'],
        bundle: true,
        outfile: 'extension.js',
        globalName: 'greyscript',
        sourcemap: false,
        minify: true,
        minifyWhitespace: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        target: 'ESNext',
        platform: 'node',
        treeShaking: true,
        external: [
          'vscode',
          'steam-user',
          'node-json-stream',
          'greybel-agent',
          'greybel-languageserver'
        ],
        define: {
          'process.env.NODE_ENV': '"production"',
          ...Object.entries(envObj).reduce((result, [key, value]) => {
            result[`process.env.${key}`] = `"${value}"`;
            return result;
          }, {})
        }
      });
  } catch (err) {
    console.error('Failed building project', { err });
    process.exit(1);
  }
};

build();
