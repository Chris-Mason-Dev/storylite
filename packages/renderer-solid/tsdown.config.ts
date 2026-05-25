import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.tsx',
    static: 'src/static.tsx',
  },
  format: 'esm',
  dts: true,
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
})
