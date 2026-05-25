import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  resolveMenuLinks,
  resolveStoryliteCustomization,
  resolveToolbarTools,
  resolveViewports,
  transformManagerHtml,
} from '../../../bin/customization.mjs'

describe('storylite customization', () => {
  it('combines convention files with config fragments and css', async () => {
    const root = await createProjectFixture({
      'manager-head.html': '<meta name="manager-file" content="true">',
      'manager-body-start.html': '<script>window.managerStart = true</script>',
      'manager-body-end.html': '<script>window.managerEnd = true</script>',
      'manager.css': '.manager-file { color: red; }',
      'ui.css': '.ui-file { color: blue; }',
      'preview-head.html': '<meta name="preview-file" content="true">',
      'preview-body.html': '<script>window.previewAlias = true</script>',
      'preview-body-start.html': '<div data-preview-start></div>',
      'preview-body-end.html': '<script>window.previewEnd = true</script>',
    })

    try {
      const customization = await resolveStoryliteCustomization(root, {
        ui: {
          css: (defaultCss) => `${defaultCss}\n.config-css { color: green; }`,
        },
        managerHead: '<meta name="manager-config" content="true">',
        previewHead: (defaultHead) => `${defaultHead}<meta name="preview-config" content="true">`,
      })

      expect(customization.manager.headHtml).toContain('manager-file')
      expect(customization.manager.headHtml).toContain('manager-config')
      expect(customization.preview.headHtml).toContain('preview-file')
      expect(customization.preview.headHtml).toContain('preview-config')
      expect(customization.preview.bodyEndHtml).toContain('previewAlias')
      expect(customization.preview.bodyEndHtml).toContain('previewEnd')
      expect(customization.projectUi.css).toContain('.manager-file')
      expect(customization.projectUi.css).toContain('.ui-file')
      expect(customization.projectUi.css).toContain('.config-css')
      expect(customization.projectUi.brand.subtitle).toBeNull()
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('allows configuring the sidebar brand subtitle', async () => {
    const root = await createProjectFixture({})

    try {
      const customization = await resolveStoryliteCustomization(root, {
        ui: {
          brand: {
            subtitle: 'Component workbench',
          },
        },
      })

      expect(customization.projectUi.brand.subtitle).toBe('Component workbench')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('normalizes attributes and appends config strings to convention defaults', async () => {
    const root = await createProjectFixture({
      'manager-body-end.html': '<script>window.fromFile = true</script>',
    })

    try {
      const customization = await resolveStoryliteCustomization(root, {
        managerHtmlAttrs: (defaults) => ({
          ...defaults,
          lang: 'es',
          hidden: true,
          inert: false,
          title: 'A "quoted" title',
        }),
        managerBodyEnd: '<script>window.fromConfig = true</script>',
        previewHtmlAttrs: {
          lang: 'fr',
          class: 'custom-preview',
          'data-invalid value': 'nope',
        },
      })

      expect(customization.manager.htmlAttrs).toEqual({
        lang: 'es',
        hidden: true,
        title: 'A "quoted" title',
      })
      expect(customization.manager.bodyEndHtml).toContain('fromFile')
      expect(customization.manager.bodyEndHtml).toContain('fromConfig')
      expect(customization.preview.htmlAttrs).toEqual({
        lang: 'fr',
        class: 'custom-preview',
      })
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('transforms manager html while preserving StoryLite boot tags', () => {
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script>window.storyliteTheme = true</script>
    <!--storylite-manager-head-->
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`

    const transformed = transformManagerHtml(html, {
      htmlAttrs: { lang: 'ca', 'data-brand': 'A&B' },
      bodyAttrs: { 'data-shell': 'manager', hidden: true },
      headHtml: '<meta name="custom-head" content="true">',
      bodyStartHtml: '<script>window.beforeApp = true</script>',
      bodyEndHtml: '<script>window.afterApp = true</script>',
    })

    expect(transformed.indexOf('<meta charset="utf-8"')).toBeLessThan(
      transformed.indexOf('<meta name="custom-head"'),
    )
    expect(transformed).toContain('<html lang="ca" data-brand="A&amp;B">')
    expect(transformed).toContain('<body data-shell="manager" hidden>')
    expect(transformed.indexOf('window.beforeApp')).toBeLessThan(transformed.indexOf('id="app"'))
    expect(transformed.indexOf('window.afterApp')).toBeGreaterThan(
      transformed.indexOf('/src/main.ts'),
    )
    expect(transformed).toContain('<div id="app"></div>')
    expect(transformed).toContain('<script type="module" src="/src/main.ts"></script>')
  })

  it('lets a project-provided manager title replace the default title', () => {
    const transformed = transformManagerHtml(
      '<html><head><title>Host title</title></head><body><div id="app"></div></body></html>',
      {
        headHtml: '<title>Project title</title>',
      },
    )

    expect(transformed.match(/<title/g)).toHaveLength(1)
    expect(transformed).toContain('<title>Project title</title>')
    expect(transformed).not.toContain('<title>StoryLite</title>')
  })

  it('normalizes project viewport presets and preserves the fluid viewport', () => {
    expect(
      resolveViewports((defaults) =>
        defaults.map((viewport) => {
          if (viewport.icon === 'mobile') return { ...viewport, width: 360 }
          if (viewport.icon === 'tablet') return { ...viewport, width: '820px' }
          return viewport
        }),
      ),
    ).toEqual([
      { label: 'Fluid', width: '100%', icon: 'fluid' },
      { label: 'Mobile', width: '360px', icon: 'mobile' },
      { label: 'Tablet', width: '820px', icon: 'tablet' },
      { label: 'Desktop', width: '1120px', icon: 'desktop' },
    ])

    expect(resolveViewports([{ label: 'Compact', width: 480, icon: 'mobile' }])).toEqual([
      { label: 'Fluid', width: '100%', icon: 'fluid' },
      { label: 'Compact', width: '480px', icon: 'mobile' },
    ])
  })

  it('normalizes toolbar tools from config without adding defaults', () => {
    expect(resolveToolbarTools()).toEqual([])

    expect(
      resolveToolbarTools((defaults) => [
        ...defaults,
        {
          type: 'toggle',
          id: 'a11y',
          label: 'A11y overlay',
          icon: 'accessibility',
          defaultValue: true,
          target: { type: 'preview-class', name: 'show-a11y' },
        },
        {
          type: 'select',
          id: 'density',
          label: 'Density',
          icon: 'layout',
          defaultValue: 'compact',
          options: [
            { label: 'Comfortable', value: 'comfortable' },
            { label: 'Compact', value: 'compact' },
            { label: '', value: 'invalid' },
            { label: 'Duplicate', value: 'compact' },
          ],
          target: { type: 'preview-class', prefix: 'density-' },
        },
        {
          type: 'link',
          id: 'docs',
          label: 'Docs',
          href: 'https://example.com/docs',
          target: '_blank',
          rel: 'noopener',
        },
        {
          type: 'link',
          id: 'unsafe',
          label: 'Unsafe',
          href: 'javascript:alert(1)',
        },
      ]),
    ).toEqual([
      {
        type: 'toggle',
        id: 'a11y',
        label: 'A11y overlay',
        icon: 'accessibility',
        defaultValue: true,
        persist: true,
        target: { type: 'preview-class', name: 'show-a11y' },
      },
      {
        type: 'select',
        id: 'density',
        label: 'Density',
        icon: 'layout',
        defaultValue: 'compact',
        options: [
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Compact', value: 'compact' },
        ],
        persist: true,
        target: { type: 'preview-class', prefix: 'density-' },
      },
      {
        type: 'link',
        id: 'docs',
        label: 'Docs',
        href: 'https://example.com/docs',
        target: '_blank',
        rel: 'noopener',
      },
    ])
  })

  it('normalizes menu links with About as the default fallback', () => {
    expect(resolveMenuLinks()).toEqual([
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/itsjavi/storylite',
        icon: 'globe',
        target: '_blank',
        rel: 'noreferrer',
      },
    ])

    expect(
      resolveMenuLinks((defaultLinks) => [
        ...defaultLinks,
        {
          id: 'docs',
          label: 'Docs',
          href: '/docs',
          icon: 'external-link',
          target: '_blank',
        },
        {
          id: 'bad',
          label: 'Bad',
          href: 'javascript:alert(1)',
        },
      ]),
    ).toEqual([
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/itsjavi/storylite',
        icon: 'globe',
        target: '_blank',
        rel: 'noreferrer',
      },
      {
        id: 'docs',
        label: 'Docs',
        href: '/docs',
        icon: 'external-link',
        target: '_blank',
        rel: 'noreferrer',
      },
    ])

    expect(resolveMenuLinks([{ id: 'bad', label: 'Bad', href: 'javascript:alert(1)' }])).toEqual(
      resolveMenuLinks(),
    )
  })
})

async function createProjectFixture(files) {
  const root = await mkdtemp(join(tmpdir(), 'storylite-customization-'))
  const storyliteDir = join(root, '.storylite')
  await mkdir(storyliteDir)

  await Promise.all(
    Object.entries(files).map(([name, content]) => writeFile(join(storyliteDir, name), content)),
  )

  return root
}
