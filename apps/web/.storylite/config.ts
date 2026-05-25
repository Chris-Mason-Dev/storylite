import { defineConfig } from '@storylite/storylite'

export default defineConfig({
  stories: ['./src/**/*.stories.ts'],
  css: ['./src/styles.css'],
  storyId: (_path, suggestedId) => suggestedId.replace(/^components-/, ''),
  managerHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-demo': 'html' }),
  managerHead: '<title>StoryLite Demo</title><meta name="storylite-demo" content="html">',
  previewHtmlAttrs: (defaults) => ({ ...defaults, 'data-storylite-preview': 'html' }),
  ui: {
    brand: {
      markHtml: '<span style="color: white;">SL</span>',
      titleHtml: '<strong>StoryLite Demo</strong>',
    },
    css: '.brand__mark { font-variant-numeric: tabular-nums; color: white; background-color: rebeccapurple; }',
    backgrounds: (defaultBgs) => [
      ...defaultBgs,
      { label: 'Mint', value: '#ecfdf5' },
      { label: 'Blueprint', value: '#eff6ff' },
    ],
    viewports: (defaultViewports) =>
      defaultViewports.map((viewport) => {
        if (viewport.icon === 'mobile') return { ...viewport, width: 360 }
        if (viewport.icon === 'tablet') return { ...viewport, width: 820 }
        if (viewport.icon === 'desktop') return { ...viewport, width: 1280 }
        return viewport
      }),
    toolbar: [
      {
        type: 'toggle',
        id: 'a11y-outlines',
        label: 'A11y outlines',
        icon: 'accessibility',
        target: { type: 'preview-class', name: 'show-a11y-outlines' },
      },
      {
        type: 'select',
        id: 'density',
        label: 'Density',
        icon: 'layout',
        options: [
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Compact', value: 'compact' },
        ],
        target: { type: 'preview-class', prefix: 'density-' },
      },
      {
        type: 'link',
        id: 'repository',
        label: 'Repository',
        icon: 'external-link',
        href: 'https://github.com/itsjavi/storylite',
        target: '_blank',
      },
    ],
    menuLinks: (defaultLinks) => [
      ...defaultLinks,
      {
        id: 'demo-source',
        label: 'Demo source',
        icon: 'external-link',
        href: 'https://github.com/itsjavi/storylite/tree/main/apps/web',
        target: '_blank',
      },
    ],
  },
})
