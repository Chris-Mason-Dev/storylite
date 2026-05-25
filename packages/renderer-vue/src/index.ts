import { defineRenderer } from '@storylite/contracts'

export default function vueRenderer() {
  return defineRenderer({
    name: 'vue',
    client: '@storylite/renderer-vue/client',
    static: '@storylite/renderer-vue/static',
    vitePlugins: async () => {
      const { default: vue } = await import('@vitejs/plugin-vue')
      return [vue()]
    },
  })
}
