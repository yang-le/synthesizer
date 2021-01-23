import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import html from '@rollup/plugin-html';
import eslint from '@rollup/plugin-eslint';
import strip from '@rollup/plugin-strip';
import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: {
        dir: 'dist',
        format: 'umd',
        name: 'main'
    },
    plugins: [
        html(),
        eslint({
            fix: true
        }),
        alias({
            entries: [
              { find: 'vue', replacement: 'vue/dist/vue.esm.js' }
            ]
        }),
        resolve(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        commonjs(),
        babel({
            babelHelpers: 'runtime',
            plugins: ['@babel/plugin-transform-runtime'],
            presets: ['@babel/preset-env']
        }),
        strip(),
        terser()
    ],
};