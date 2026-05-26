import { defineRenderer } from '@storylite/contracts'

export default function svelteRenderer() {
  return defineRenderer({
    name: 'svelte',
    client: '@storylite/renderer-svelte/client',
    static: '@storylite/renderer-svelte/static',
    vitePlugins: async () => {
      const { svelte } = await import('@sveltejs/vite-plugin-svelte')
      return [svelte()]
    },
  })
}
