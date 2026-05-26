import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const virtualProjectId = 'virtual:storylite/project'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    {
      name: 'storylite-manager-project-module',
      resolveId(id) {
        if (id === virtualProjectId) {
          return {
            id: '../project.js',
            external: true,
          }
        }

        return null
      },
    },
  ],
  build: {
    outDir: 'dist/manager',
    emptyOutDir: true,
    assetsDir: 'storylite-assets',
  },
})
