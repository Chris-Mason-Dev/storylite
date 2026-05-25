import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { fileUrl, storyPagePath } from './project-graph.mjs'

const reservedExports = new Set(['default', '__esModule'])
const appHeadMarker = '<!--app-head-->'
const appHtmlMarker = '<!--app-html-->'

export async function injectPrerenderedStoryLiteShell({
  outDir,
  prerenderOutDir,
  managerCss = '',
}) {
  try {
    const indexPath = resolve(outDir, 'index.html')
    const entryPath = resolve(prerenderOutDir, 'entry-server.js')
    const template = await readFile(indexPath, 'utf8')
    const { render } = await import(pathToFileURL(entryPath).href)
    const rendered = await render()

    await writeFile(indexPath, injectPrerenderedAppHtml(template, rendered, managerCss))
  } finally {
    await rm(prerenderOutDir, { recursive: true, force: true })
  }
}

export function injectPrerenderedAppHtml(template, rendered, managerCss = '') {
  if (!template.includes(appHeadMarker)) {
    throw new Error(`Missing ${appHeadMarker} marker in built StoryLite index.html`)
  }

  if (!template.includes(appHtmlMarker)) {
    throw new Error(`Missing ${appHtmlMarker} marker in built StoryLite index.html`)
  }

  const html = template
    .replace(appHeadMarker, () => rendered.head)
    .replace(appHtmlMarker, () => rendered.html)

  return injectManagerCss(html, managerCss)
}

export async function emitStaticStoryPages({
  appRoot,
  projectRoot,
  outDir,
  base,
  graph,
  rendererPlugins = [],
}) {
  const manifest = await graph.load({ force: true })
  const server = await createServer({
    configFile: false,
    root: projectRoot,
    appType: 'custom',
    plugins: rendererPlugins,
    server: {
      middlewareMode: true,
      hmr: false,
      ws: false,
      fs: {
        allow: [appRoot, projectRoot, resolve(projectRoot, '..'), resolve(projectRoot, '../..')],
      },
    },
    optimizeDeps: {
      entries: [],
      noDiscovery: true,
    },
  })

  try {
    const stories = await loadStaticStories(server, manifest)
    const staticRenderers = await loadStaticRenderers(server, manifest)
    const collisions = findStoryIdCollisions(stories)

    if (collisions.length) {
      throw new Error(formatStoryIdCollisionError(collisions))
    }

    const css = await loadCss(server, manifest.cssFiles)

    await Promise.all(
      stories.map(async (story) => {
        const html = await renderStaticStoryPage(story, manifest, css, base, staticRenderers)
        const path = resolve(outDir, storyPagePath(story.id))
        await mkdir(dirname(path), { recursive: true })
        await writeFile(path, html)
      }),
    )
  } finally {
    await server.close()
  }
}

async function loadStaticRenderers(server, manifest) {
  const entries = await Promise.all(
    manifest.rendererAdapters.map(async (adapter) => {
      if (!adapter.staticImport) {
        return [adapter.name, null]
      }

      return [adapter.name, await server.ssrLoadModule(adapter.staticImport)]
    }),
  )

  return Object.fromEntries(entries)
}

async function loadStaticStories(server, manifest) {
  const entries = await Promise.all(
    manifest.storyFiles.map(async (file) => {
      const module = await server.ssrLoadModule(fileUrl(file))
      return normalizeStoryModule(
        relative(manifest.projectRoot, file),
        module,
        manifest.storyIdResolver,
      )
    }),
  )

  return entries
    .flat()
    .sort(
      (left, right) => left.title.localeCompare(right.title) || left.name.localeCompare(right.name),
    )
}

export async function loadCss(server, files) {
  const contents = await Promise.all(
    files.map(async (file) => {
      const module = await server.ssrLoadModule(`${fileUrl(file)}?inline`)
      return module.default ?? ''
    }),
  )
  return contents.join('\n\n')
}

async function renderStaticStoryPage(story, manifest, globalCss, base, staticRenderers) {
  const title = `${story.title} - ${story.name}`
  const storyCss = collectCss(story)
  const result = await renderStaticStory(story, staticRenderers)
  const warning = result.warning
    ? `<p class="sl-static-warning">${escapeHtml(result.warning)}</p>`
    : ''

  return `<!doctype html>
<html lang="${escapeAttribute(manifest.preview.htmlAttrs?.lang ?? 'en')}" class="storylite-preview">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    ${manifest.preview.headHtml ?? ''}
    <style>
      ${previewBaseCss()}
      ${globalCss}
      ${storyCss}
      .sl-static-warning {
        margin: 0 0 1rem;
        padding: .75rem 1rem;
        border: 1px solid #f59e0b;
        border-radius: .5rem;
        color: #92400e;
        background: #fffbeb;
      }
    </style>
  </head>
  <body${renderAttrs(manifest.preview.bodyAttrs)}>
    ${manifest.preview.bodyStartHtml ?? ''}
    <main id="ss-canvas">
      ${warning}
      ${result.html}
    </main>
    ${manifest.preview.bodyEndHtml ?? ''}
    <p class="sl-static-back"><a href="${relativeUrl(base, '../../index.html')}">Back to StoryLite</a></p>
  </body>
</html>`
}

async function renderStaticStory(story, staticRenderers) {
  if (story.renderer === 'web-components' && !story.render && typeof story.component === 'string') {
    return { html: renderWebComponentStory(story) }
  }

  if (story.renderer !== 'html') {
    const renderer = resolveStaticRenderer(staticRenderers[story.renderer], story.renderer)
    return renderer(story)
  }

  if (!story.render) {
    return { html: '' }
  }

  const output = story.render(story.args, {
    id: story.id,
    title: story.title,
    name: story.name,
    canvas: null,
    document: null,
    window: null,
  })

  if (typeof output === 'string') {
    return { html: output }
  }

  if (isNodeLike(output)) {
    return {
      html: '',
      warning: 'This story returns a DOM Node or DocumentFragment, which is only rendered in dev.',
    }
  }

  return { html: output == null ? '' : String(output) }
}

function resolveStaticRenderer(module, renderer) {
  if (!module) {
    throw new Error(
      `Story uses renderer "${renderer}", but that renderer did not register a static renderer.`,
    )
  }

  if (typeof module.renderStory === 'function') {
    return module.renderStory
  }

  if (typeof module.default === 'function') {
    return module.default
  }

  if (typeof module.default?.renderStory === 'function') {
    return module.default.renderStory
  }

  throw new Error(`Renderer adapter "${renderer}" does not export a static renderStory function.`)
}

function normalizeStoryModule(importPath, module, resolveId) {
  const meta = isRecord(module.default) ? module.default : {}
  const stories = []
  const title = typeof meta.title === 'string' && meta.title.trim() ? meta.title.trim() : 'Stories'

  for (const [exportName, value] of Object.entries(module)) {
    if (reservedExports.has(exportName)) {
      continue
    }

    const storyExport = normalizeStoryExport(value)
    if (!storyExport) {
      continue
    }

    const args = { ...(meta.args ?? {}), ...(storyExport.args ?? {}) }
    const parameters = { ...(meta.parameters ?? {}), ...(storyExport.parameters ?? {}) }
    const component = storyExport.component ?? meta.component
    const render = storyExport.render

    stories.push({
      id: storyId(importPath, exportName, resolveId),
      importPath,
      exportName,
      title,
      name: storyExport.name ?? labelFromExportName(exportName),
      component,
      args,
      parameters,
      render,
      renderer:
        parameters.renderer ??
        (typeof component === 'string' && !render ? 'web-components' : 'html'),
    })
  }

  return stories
}

function renderWebComponentStory(story) {
  const attrs = Object.entries(story.args)
    .filter(([, value]) => isPrimitive(value))
    .map(([name, value]) => {
      const attr = kebabCase(name)
      return value === true
        ? ` ${attr}`
        : value === false
          ? ''
          : ` ${attr}="${escapeAttribute(value)}"`
    })
    .join('')
  const label = typeof story.args.label === 'string' ? escapeHtml(story.args.label) : ''

  return `<${story.component}${attrs}>${label}</${story.component}>`
}

function previewBaseCss() {
  return `:root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
* { box-sizing: border-box; }
body { min-block-size: 100dvh; margin: 0; }
#ss-canvas { min-block-size: 100dvh; padding: 16px; }
.sl-static-back { position: fixed; inset-block-end: 1rem; inset-inline-end: 1rem; margin: 0; }
.sl-static-back a { color: inherit; }`
}

function normalizeStoryExport(value) {
  if (typeof value === 'function') {
    return { render: value }
  }

  return isRecord(value) ? value : null
}

function storyId(importPath, exportName, resolveId) {
  const suggestedId = suggestedStoryId(importPath, exportName)
  const resolvedId = resolveId?.(importPath, suggestedId) ?? suggestedId
  return String(resolvedId || suggestedId).trim() || suggestedId
}

function suggestedStoryId(importPath, exportName) {
  const pathPart = importPath
    .replace(/^\.\.\//, '')
    .replace(/^(?:\.\/)?src\//, '')
    .replace(/\.(stories|story)\.[cm]?[tj]sx?$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `${pathPart}--${kebabCase(exportName)}`
}

function findStoryIdCollisions(stories) {
  const byId = new Map()

  for (const story of stories) {
    const group = byId.get(story.id) ?? []
    group.push(story)
    byId.set(story.id, group)
  }

  return Array.from(byId.entries())
    .filter(([, group]) => group.length > 1)
    .map(([id, group]) => ({ id, stories: group }))
}

function formatStoryIdCollisionError(collisions) {
  const details = collisions
    .map(
      (collision) =>
        `- ${collision.id}\n${collision.stories
          .map((story) => `  - ${story.importPath}:${story.exportName}`)
          .join('\n')}`,
    )
    .join('\n')

  return `StoryLite found duplicate story IDs. Change story exports or customize storyId in .storylite/config.ts.\n${details}`
}

function labelFromExportName(exportName) {
  return exportName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function collectCss(story) {
  const css = story.parameters.css
  return typeof css === 'string' ? css : (css?.join('\n\n') ?? '')
}

function renderAttrs(attrs) {
  return Object.entries(attrs ?? {})
    .filter(([, value]) => value !== false && value !== null && value !== undefined)
    .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`))
    .join('')
}

function relativeUrl(base, fallback) {
  return base === './' ? fallback : base
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNodeLike(value) {
  return isRecord(value) && typeof value.nodeType === 'number'
}

function isPrimitive(value) {
  return ['string', 'number', 'boolean'].includes(typeof value)
}

function kebabCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;')
}

function injectManagerCss(html, css) {
  const trimmedCss = css.trim()

  if (!trimmedCss) {
    return html
  }

  const style = `<style id="storylite-manager-custom-css">\n${escapeStyleText(trimmedCss)}\n</style>`
  return html.replace('</head>', `${style}\n  </head>`)
}

function escapeStyleText(value) {
  return value.replaceAll('</style', '<\\/style')
}
