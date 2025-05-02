const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const { terser } = require('rollup-plugin-terser');
const json = require('@rollup/plugin-json');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/livepix-react-sdk.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/livepix-react-sdk.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/livepix-react-sdk.umd.js',
      format: 'umd',
      name: 'LivePixReactSDK',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  ],
  plugins: [
    json(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    terser(),
  ],
  external: ['react', 'react-dom'],
};
