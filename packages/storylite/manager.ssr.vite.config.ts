import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const virtualProjectId = 'virtual:storylite/project'

function storyliteProjectModule() {
  return {
    name: 'storylite-manager-server-project-module',
    resolveId(id: string) {
      if (id !== virtualProjectId) {
        return null
      }

      return {
        id: virtualProjectId,
        external: true,
      }
    },
  }
}

export default defineConfig({
  plugins: [svelte(), storyliteProjectModule()],
  build: {
    ssr: 'src/entry-server.ts',
    outDir: 'dist/manager-server',
    emptyOutDir: true,
    copyPublicDir: false,
    rolldownOptions: {
      external: [virtualProjectId],
      output: {
        entryFileNames: 'entry-server.mjs',
        chunkFileNames: '[name]-[hash].mjs',
      },
    },
  },
  ssr: {
    noExternal: true,
  },
})
