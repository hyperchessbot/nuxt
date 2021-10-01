import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: ['chess.js'],
  output: {
    dir: 'rollup',
    format: 'cjs'
  },
  plugins: [commonjs(), nodeResolve()]  
};
