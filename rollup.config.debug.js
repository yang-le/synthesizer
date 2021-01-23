import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import html from '@rollup/plugin-html';

export default {
    input: 'demo/index.js',
    output: {
        file: 'build/demo.js',
        format: 'umd',
        name: 'main',
        sourcemap: true
    },
    plugins: [
        html(),
        alias({
            entries: [
              { find: 'vue', replacement: 'vue/dist/vue.esm.js' }
            ]
        }),
        resolve(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('')
        }),
        commonjs(),
        babel({
            babelHelpers: 'runtime',
            plugins: ['@babel/plugin-transform-runtime'],
            presets: ['@babel/preset-env']
        })
    ],
};