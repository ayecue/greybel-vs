const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const externalGlobals  = require('rollup-plugin-external-globals');
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
            'axios': 'require(\'axios\')'
        }
    },
    plugins: [
        dotenv(),
        externalGlobals({
            'react': '{"$":"react"}',
            'react-dom': '{"$":"react-dom"}',
            'prismjs': '{"$":"prismjs","languages":{}}',
            'react-markdown': '{"$":"react-markdown"}',
            'react-in-viewport': '{"$":"react-in-viewport"}',
        }),
        json(),
        commonjs({
            esmExternals: ['vscode', 'path'],
            sourceMap: false
        }),
        nodePolyfills(),
        nodeResolve({
            preferBuiltins: false
        }),
        //terser()
    ],
    external: [
        'vscode',
        'path',
        'react',
        'react-dom', 
        'prismjs',
        'react-markdown',
        'react-in-viewport',
        'axios'
    ]
};

export default options;