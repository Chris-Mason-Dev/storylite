import { defineConfig } from '@storylite/storylite'
import svelte from '@storylite/renderer-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  stories: ['./src/**/*.stories.ts'],
  css: ['./src/styles.css'],
  vitePlugins: [tailwindcss()],
  renderers: [svelte()],
  managerHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-demo': 'svelte' }),
  previewHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-preview': 'svelte' }),
  ui: {
    brand: {
      markHtml: '<span>S</span>',
      titleHtml: '<strong>Svelte Demo</strong>',
    },
    backgrounds: (defaultBgs) => [...defaultBgs, { label: 'Amber', value: '#fffbeb' }],
  },
})
