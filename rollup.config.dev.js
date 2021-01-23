import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import html from '@rollup/plugin-html';
import eslint from '@rollup/plugin-eslint';

export default {
    input: 'src/index.js',
    output: {
        dir: 'dev',
        format: 'umd',
        name: 'main',
        sourcemap: true
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