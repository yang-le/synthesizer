import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import strip from '@rollup/plugin-strip';
import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: [{
        file: 'build/synthesizer.min.js',
        format: 'umd',
        exports: 'named',
        name: 'Synth',
        sourcemap: true,
        plugins: [terser()],
        globals: {
            rete: 'Rete'
        }
    }, {
        file: 'build/synthesizer.common.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
    }, {
        file: 'build/synthesizer.esm.js',
        format: 'es',
        exports: 'named',
        sourcemap: true
    }],
    plugins: [
        eslint({
            fix: true
        }),
        resolve(),
        commonjs(),
        babel({
            babelHelpers: 'runtime',
            plugins: ['@babel/plugin-transform-runtime'],
            presets: ['@babel/preset-env']
        }),
        strip()
    ],
    external: ['rete']
};