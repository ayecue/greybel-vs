const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');

const options = {
    input: 'out/extension.js',
    output: {
        file: 'extension.js',
        name: 'greyscript',
        exports: 'named',
        format: 'cjs',
        globals: {
            'vscode': 'vscode',
            'path': 'path'
        }
    },
    plugins: [
        json(),
        commonjs({
            esmExternals: ['vscode', 'path'],
            sourceMap: false
        }),
        nodePolyfills(),
        nodeResolve({
            preferBuiltins: false
        }),
        terser()
    ],
    external: ['vscode', 'path']
};

export default options;