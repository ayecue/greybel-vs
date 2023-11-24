const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const dotenv = require('rollup-plugin-dotenv').default;

const options = {
    input: 'out/preview/view.js',
    output: {
        file: 'preview.view.js',
        format: 'iife'
    },
    plugins: [
        dotenv(),
        json(),
        commonjs(),
        nodePolyfills(),
        nodeResolve({
            browser: true,
            preferBuiltins: false
        }),
        babel({
            presets: ['@babel/preset-react', '@babel/preset-env', {
                exclude: "transform-typeof-symbol"
            }],
            babelHelpers: 'runtime',
            plugins: [
                ["@babel/plugin-transform-runtime", {
                    regenerator: true
                }]
            ]
        }),
        terser()
    ]
};

export default options;