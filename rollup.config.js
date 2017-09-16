const buble = require('rollup-plugin-buble');               // https://buble.surge.sh/guide/
const commonjs = require('rollup-plugin-commonjs');         // https://github.com/rollup/rollup-plugin-commonjs
const eslint = require('rollup-plugin-eslint');             // https://github.com/TrySound/rollup-plugin-eslint
const nodeResolve = require('rollup-plugin-node-resolve');  // https://github.com/rollup/rollup-plugin-node-resolve

const plugins = [
    commonjs({ include: 'node_modules/**' }),
    nodeResolve({ jsnext: true, main: true }),
    eslint(),
    buble()
];

const config = require('./package.json');

module.exports = {
    entry: 'src/index.js',
    exports: 'default',
    plugins,
    targets: [
        {
            dest: config.main,
            format: 'umd',
            moduleName: config.moduleName
        }, {
            dest: config.module,
            format: 'es'
        }
    ]
};