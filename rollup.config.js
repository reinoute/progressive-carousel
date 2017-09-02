const buble = require('rollup-plugin-buble');               // https://buble.surge.sh/guide/
const commonjs = require('rollup-plugin-commonjs');         // https://github.com/rollup/rollup-plugin-commonjs
const eslint = require('rollup-plugin-eslint');             // https://github.com/TrySound/rollup-plugin-eslint
const nodeResolve = require('rollup-plugin-node-resolve');  // https://github.com/rollup/rollup-plugin-node-resolve

const plugins = [
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
    eslint(),
    buble()
];

const pkg = require('./package.json');

module.exports = {
    entry: 'src/index.js',
    dest: 'dist/progressive-carousel.js',
    format: 'umd',
    exports: 'default',
    plugins,
    moduleName: pkg.moduleName
};