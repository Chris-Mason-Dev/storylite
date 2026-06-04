import { defineConfig } from '@storylite/storylite'
import { readFileSync } from 'node:fs'

const homeMarkdown = readFileSync(new URL('../../../README.md', import.meta.url), 'utf8')

export default defineConfig({
  stories: ['./src/**/*.stories.ts'],
  css: ['./src/styles.css'],
  home: homeMarkdown,
  publicDir: './public',
  storyId: (_path, suggestedId) => suggestedId.replace(/^components-/, ''),
  storySort: {
    order: [
      'Examples',
      [
        'Pure CSS',
        ['Layout', 'Button', 'Card', 'Field', 'Badge'],
        'Web Components',
        'Single Named Export',
        'Single Default Story',
      ],
    ],
  },
  ui: {
    menuLinks: (defaultLinks) => [
      {
        id: 'llms',
        label: 'llms.txt',
        icon: 'zap',
        href: 'https://context7.com/itsjavi/storylite/llms.txt?tokens=10000',
      },
      ...defaultLinks,
    ],
    brand: {
      subtitle: 'Component Stories',
    },
    backgrounds(defaultBackgrounds) {
      return [...defaultBackgrounds, { label: '👔 Brand', value: 'var(--demo-canvas-bg)' }]
    },
  },
})
