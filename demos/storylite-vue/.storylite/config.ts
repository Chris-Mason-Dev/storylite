import { defineConfig } from '@storylite/storylite'
import vue from '@storylite/renderer-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  stories: ['./src/**/*.stories.ts'],
  css: ['./src/styles.css'],
  vitePlugins: [tailwindcss()],
  renderers: [vue()],
  managerHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-demo': 'vue' }),
  previewHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-preview': 'vue' }),
  ui: {
    brand: {
      markHtml: '<span>V</span>',
      titleHtml: '<strong>Vue Demo</strong>',
    },
    backgrounds: (defaultBgs) => [...defaultBgs, { label: 'Emerald', value: '#ecfdf5' }],
  },
})
