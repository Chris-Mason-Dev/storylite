import { defineConfig } from '@storylite/storylite'
import solid from '@storylite/renderer-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  stories: ['./src/**/*.stories.tsx'],
  css: ['./src/styles.css'],
  vitePlugins: [tailwindcss()],
  renderers: [solid()],
  managerHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-demo': 'solid' }),
  previewHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-preview': 'solid' }),
  ui: {
    brand: {
      markHtml: '<span>O</span>',
      titleHtml: '<strong>Solid Demo</strong>',
    },
    backgrounds: (defaultBgs) => [...defaultBgs, { label: 'Sky', value: '#eff6ff' }],
  },
})
