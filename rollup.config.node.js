const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const dotenv = require('rollup-plugin-dotenv').default;

const options = {
    input: 'out/extension.js',
    output: {
        file: 'extension.js',
        name: 'greyscript',
        exports: 'named',
        format: 'cjs'
    },
    plugins: [
        dotenv(),
        json(),
        commonjs({
            sourceMap: false
        }),
        terser()
    ]
};

export default options;