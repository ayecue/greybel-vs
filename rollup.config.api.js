const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-node-polyfills');
const externalGlobals  = require('rollup-plugin-external-globals');

const options = {
    input: 'out/api/view.js',
    output: {
        file: 'api.view.js',
        format: 'iife'
    },
    external: ['react', 'react-dom'],
    plugins: [
        externalGlobals({
            'react': 'React',
            'react-dom': 'ReactDOM'
        }),
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