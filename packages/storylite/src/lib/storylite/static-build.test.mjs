import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'vite'
import { describe, expect, it } from 'vitest'
import {
  injectPrerenderedAppHtml,
  loadCss,
  rewritePublicAssetUrls,
} from '../../../bin/static-build.mjs'

describe('storylite static build', () => {
  it('injects prerendered manager head and html into the built shell', () => {
    const html = injectPrerenderedAppHtml(
      '<html><head><!--app-head--></head><body><div id="app"><!--app-html--></div><script type="module" src="./assets/app.js"></script></body></html>',
      {
        head: '',
        html: '<main class="storylite-shell"><article class="home-page"><h1>Demo Home</h1></article></main>',
      },
      '.home-page{color:red}',
    )

    expect(html).toContain('<style id="storylite-manager-custom-css">')
    expect(html).toContain('<h1>Demo Home</h1>')
    expect(html).toContain('<script type="module" src="./assets/app.js"></script>')
    expect(html).not.toContain('<!--app-head-->')
    expect(html).not.toContain('<!--app-html-->')
  })

  it('loads static story css through vite transforms', async () => {
    const root = await mkdtemp(join(tmpdir(), 'storylite-static-css-'))
    const srcDir = join(root, 'src')
    await mkdir(srcDir)

    const cssFile = join(srcDir, 'styles.css')
    await writeFile(cssFile, '.static-demo { color: __TOKEN__; }')

    const server = await createServer({
      configFile: false,
      root,
      appType: 'custom',
      plugins: [
        {
          name: 'test-static-css-transform',
          transform(code, id) {
            if (id.includes('styles.css')) {
              return code.replace('__TOKEN__', 'transformed')
            }

            return null
          },
        },
      ],
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      optimizeDeps: {
        entries: [],
        noDiscovery: true,
      },
    })

    try {
      await expect(loadCss(server, [cssFile])).resolves.toContain('color: transformed')
    } finally {
      await server.close()
      await rm(root, { force: true, recursive: true })
    }
  })

  it('rewrites public asset URLs for nested static story pages', () => {
    const publicAssets = new Set(['/favicon.ico', '/images/logo.png', '/fonts/ui.woff2'])
    const html = [
      '<link rel="icon" href="/favicon.ico">',
      '<img src="./images/logo.png?size=2x">',
      '<img srcset="/images/logo.png 1x, /missing.png 2x">',
      '<a href="/docs">Docs</a>',
      '<style>@font-face { src: url("/fonts/ui.woff2"); }</style>',
    ].join('')

    expect(rewritePublicAssetUrls(html, publicAssets, './', '../../')).toContain(
      'href="../../favicon.ico"',
    )
    expect(rewritePublicAssetUrls(html, publicAssets, './', '../../')).toContain(
      'src="../../images/logo.png?size=2x"',
    )
    expect(rewritePublicAssetUrls(html, publicAssets, './', '../../')).toContain(
      'srcset="../../images/logo.png 1x, /missing.png 2x"',
    )
    expect(rewritePublicAssetUrls(html, publicAssets, './', '../../')).toContain('href="/docs"')
    expect(rewritePublicAssetUrls(html, publicAssets, './', '../../')).toContain(
      'url("../../fonts/ui.woff2")',
    )
  })

  it('rewrites public asset URLs with configured base paths', () => {
    const publicAssets = new Set(['/favicon.ico', '/images/logo.png'])
    const html = '<link rel="icon" href="/favicon.ico"><img src="./images/logo.png">'

    expect(rewritePublicAssetUrls(html, publicAssets, '/storylite/', '../../')).toContain(
      'href="/storylite/favicon.ico"',
    )
    expect(rewritePublicAssetUrls(html, publicAssets, '/storylite/', '../../')).toContain(
      'src="/storylite/images/logo.png"',
    )
  })
})
