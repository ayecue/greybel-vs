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
        "querystring",
        "greyscript-core",
        "greyscript-meta/dist/meta",
        "greybel-transpiler",
        "color-convert",
        "greybel-core",
        "greybel-mock-environment/dist/data/scripts",
        "@vscode/debugadapter",
        "another-ansi",
        "greybel-gh-mock-intrinsics",
        "greybel-interpreter",
        "greybel-intrinsics",
        "lru-cache",
        "greybel-c2-agent",
        "text-encoder-lite",
        "css-color-names",
        "text-mesh-transformer",
        "ansi-escapes"
    ]
};

export default options;