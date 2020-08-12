import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';

const VERSION = process.env.VERSION || 'snapshot'; // default snapshot
// const SOURCEMAPS = process.env.SOURCEMAPS === 'true'; // default false

const input = './src/js/index.js';

const name = 'MODviz';

const configs = [
  {
    input,
    output: {
      file: 'build/MODviz.umd.js',
      format: 'umd',
      name,
      sourcemap: 'inline'
    },
    plugins: [
      nodeResolve(),
      commonjs({ include: '**/node_modules/**' }),
    ]
  },

  // {
  //   input,
  //   output: {
  //     file: 'build/MODviz.min.js',
  //     format: 'umd',
  //     name
  //   },
  //   plugins: [
  //     nodeResolve(),
  //     commonjs({ include: '**/node_modules/**' })
  //   ]
  // }
]

export default configs
