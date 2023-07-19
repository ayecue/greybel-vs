const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const dotenv = require('rollup-plugin-dotenv').default;

const options = {
    input: 'out/extension.js',
    output: {
        file: 'extension.js',
        name: 'greyscript',
        exports: 'named',
        format: 'cjs',
        globals: {
            'vscode': 'vscode'
        }
    },
    plugins: [
        dotenv(),
        json(),
        commonjs({
            sourceMap: false,
            ignoreDynamicRequires: ['net']
        }),
        nodeResolve({
            preferBuiltins: false
        }),
        terser()
    ],
    external: [
        'vscode',
        "path",
        "fs",
        "url",
        "net",
        "events",
        "os",
        "https",
        "stream",
        "http",
        "util",
        "tty",
        "readline",
        "crypto",
        "zlib",
        "tls",
        "dns",
        "querystring"
    ]
};

export default options;