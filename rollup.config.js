import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/main.js',
  dest: 'bundle.js',
  sourceMap: true,
  format: 'iife',
  plugins: [babel()]
};
