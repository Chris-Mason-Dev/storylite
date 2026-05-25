import { defineConfig } from '@storylite/storylite'
import preact from '@storylite/renderer-preact'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  stories: ['./src/**/*.stories.tsx'],
  css: ['./src/styles.css'],
  vitePlugins: [tailwindcss()],
  renderers: [preact()],
  managerHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-demo': 'preact' }),
  managerHead: '<meta name="storylite-demo" content="preact">',
  previewHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-preview': 'preact' }),
  ui: {
    brand: {
      markHtml: '<span>P</span>',
      titleHtml: '<strong>Preact Demo</strong>',
    },
    backgrounds: (defaultBgs) => [
      ...defaultBgs,
      { label: 'Mint', value: '#ecfdf5' },
      { label: 'Blue', value: '#eff6ff' },
    ],
  },
})
