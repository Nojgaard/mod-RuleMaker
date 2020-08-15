import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import vue from 'rollup-plugin-vue2'
// import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';

const VERSION = process.env.VERSION || 'snapshot'; // default snapshot
// const SOURCEMAPS = process.env.SOURCEMAPS === 'true'; // default false

const input = './src/index.js';

const name = 'MODviz';
const NODE_ENV = process.env.NODE_ENV === 'development' ? 'development' : 'production'; // default prod

const envVariables = {
  'process.env.VERSION': JSON.stringify(VERSION),
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
};

const configs = [
  {
    input,
    output: {
      file: 'build/MODviz.umd.js',
      format: 'umd',
      name,
      sourcemap: 'inline'
    },
    cache: 'rollup',
    plugins: [
      replace(envVariables),
      vue({include: './src/**/*.vue'}),
      postcss({
        extensions: ['.css'],
      }),
      nodeResolve(),
      commonjs({ include: '**/node_modules/**' }),
      commonjs({ include: './src/core/grammars/*.js' }),
      
    ],
  },

  // {
  //   input,
  //   output: {
  //     file: 'build/MODviz.min.js',
  //     format: 'umd',
  //     name
  //   },
  //   plugins: [
  //     postcss({
  //       extensions: ['.css'],
  //     }),
  //     nodeResolve(),
  //     commonjs({ include: '**/node_modules/**' }),
  //     commonjs({ include: './src/js/grammars/*.js' }),
  //     terser()
  //   ]
  // }
]

export default configs
