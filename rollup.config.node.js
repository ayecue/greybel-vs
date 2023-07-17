const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const dotenv = require('rollup-plugin-dotenv').default;

const options = {
    input: 'out/extension.js',
    output: {
        file: 'extension.js',
        name: 'greyscript',
        exports: 'named',
        format: 'cjs',
        globals: {
            'vscode': 'vscode',
            'path': 'path',
            'https': 'https',
            'net': 'net'
        }
    },
    plugins: [
        dotenv(),
        json(),
        commonjs({
            esmExternals: ['vscode', 'path', 'net'],
            sourceMap: false,
            ignoreDynamicRequires: ['net']
        }),
        nodePolyfills(),
        nodeResolve({
            preferBuiltins: false
        }),
        terser()
    ],
    external: [
        'vscode',
        'path',
        'net',
        'https'
    ]
};

export default options;