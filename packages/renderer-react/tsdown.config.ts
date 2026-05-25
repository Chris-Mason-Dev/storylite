import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    static: 'src/static.ts',
  },
  format: 'esm',
  dts: true,
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
})
