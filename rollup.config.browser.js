const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const externalGlobals  = require('rollup-plugin-external-globals');

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
        externalGlobals({
            'react': '{"$":"react"}',
            'react-dom': '{"$":"react-dom"}',
            'prismjs': '{"$":"prismjs","languages":{}}',
            'react-markdown': '{"$":"react-markdown"}',
            'react-in-viewport': '{"$":"react-in-viewport"}',
        }),
        json(),
        commonjs({
            esmExternals: ['vscode'],
            sourceMap: false
        }),
        nodePolyfills(),
        nodeResolve({
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
    external: ['vscode', 'react', 'react-dom', 'prismjs', 'react-markdown', 'react-in-viewport']
};

export default options;