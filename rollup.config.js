import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/web.js',
  output: {
    file: 'www/web.js',
    format: 'es',
    sourcemap: true,
    compact: true
  },
  plugins: [nodeResolve(), commonjs()]
}
