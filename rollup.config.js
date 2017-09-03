const buble = require('rollup-plugin-buble');               // https://buble.surge.sh/guide/
const commonjs = require('rollup-plugin-commonjs');         // https://github.com/rollup/rollup-plugin-commonjs
const eslint = require('rollup-plugin-eslint');             // https://github.com/TrySound/rollup-plugin-eslint
const nodeResolve = require('rollup-plugin-node-resolve');  // https://github.com/rollup/rollup-plugin-node-resolve
const uglify = require('rollup-plugin-uglify');             // https://github.com/TrySound/rollup-plugin-uglify

const isProduction = (process.env.NODE_ENV === 'production');

const plugins = [
    nodeResolve({  main: true }),
    commonjs({ include: 'node_modules/**' }),
    eslint(),
    buble()
];

if (isProduction) {
    plugins.push(uglify());
}

module.exports = {
    entry: 'src/index.js',
    dest: 'index.js',
    format: 'iife',
    plugins,
};