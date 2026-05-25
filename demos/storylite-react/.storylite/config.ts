import { defineConfig } from '@storylite/storylite'
import react from '@storylite/renderer-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  stories: ['./src/**/*.stories.tsx'],
  css: ['./src/styles.css'],
  vitePlugins: [tailwindcss()],
  renderers: [react()],
  managerHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-demo': 'react' }),
  managerHead: '<meta name="storylite-demo" content="react">',
  previewHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-preview': 'react' }),
  ui: {
    brand: {
      markHtml: '<span>R</span>',
      titleHtml: '<strong>React Demo</strong>',
    },
    css: '.brand__mark { font-variant-numeric: tabular-nums; }',
    backgrounds: (defaultBgs) => [
      ...defaultBgs,
      { label: 'Rose', value: '#fff1f2' },
      { label: 'Indigo', value: '#eef2ff' },
    ],
    viewports: (defaultViewports) =>
      defaultViewports.map((viewport) => {
        if (viewport.icon === 'mobile') return { ...viewport, width: 393 }
        if (viewport.icon === 'tablet') return { ...viewport, width: 744 }
        if (viewport.icon === 'desktop') return { ...viewport, width: 1366 }
        return viewport
      }),
  },
})
