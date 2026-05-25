import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    public: 'src/public.ts',
  },
  tsconfig: 'tsconfig.app.json',
  format: 'esm',
  dts: true,
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
})
