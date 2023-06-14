const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const dotenv = require('rollup-plugin-dotenv').default;

const options = {
    input: 'out/extension.js',
    output: {
        file: 'extension.browser.js',
        name: 'greyscript',
        exports: 'named',
        format: 'cjs',
        globals: {
            'vscode': 'require(\'vscode\')'
        }
    },
    plugins: [
        dotenv(),
        json(),
        commonjs({
            esmExternals: ['vscode'],
            sourceMap: false
        }),
        nodePolyfills(),
        nodeResolve({
            browser: true,
            preferBuiltins: false
        }),
        babel({
            presets: ['@babel/preset-env'],
            babelHelpers: 'runtime',
            plugins: [
                ["@babel/plugin-transform-runtime", {
                    "regenerator": true
                }]
            ]
        }),
       terser()
    ],
    external: [
        'vscode'
    ]
};

export default options;