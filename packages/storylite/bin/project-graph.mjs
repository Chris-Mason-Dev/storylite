import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { isAbsolute, relative, resolve } from 'node:path'
import fg from 'fast-glob'
import { compile as compileMdsvex } from 'mdsvex'
import { render as renderSvelte } from 'svelte/server'
import { compile as compileSvelte } from 'svelte/compiler'
import { loadConfigFromFile } from 'vite'
import { resolveStoryliteCustomization } from './customization.mjs'

export const virtualProjectId = 'virtual:storylite/project'
export const resolvedVirtualProjectId = `\0${virtualProjectId}`

const defaultConfig = { stories: ['./src/**/*.stories.{ts,tsx,js,jsx}'], css: [] }
const builtinRenderers = new Set(['html', 'web-components'])
const conventionFileNames = [
  'manager-head.html',
  'manager-body-start.html',
  'manager-body-end.html',
  'manager.css',
  'ui.css',
  'preview-head.html',
  'preview-body.html',
  'preview-body-start.html',
  'preview-body-end.html',
]

export function createProjectGraph(root) {
  let server = null
  let cachedManifest = null

  return {
    setServer(nextServer) {
      server = nextServer
    },

    async load({ force = false } = {}) {
      if (!force && cachedManifest) {
        return cachedManifest
      }

      cachedManifest = await loadManifest(root, server)
      return cachedManifest
    },

    invalidate() {
      cachedManifest = null
    },

    isProjectFile(file) {
      return isProjectFile(root, file)
    },

    shouldFullReload(file) {
      const normalized = relative(root, file).replaceAll('\\', '/')
      return (
        normalized === '.storylite/config.ts' ||
        normalized === '.storylite/config.js' ||
        normalized === '.storylite/home.md' ||
        conventionFileNames.some((name) => normalized === `.storylite/${name}`)
      )
    },
  }
}

export async function loadManifest(root, server = null) {
  const configPath = findConfigPath(root)
  const config = await loadStoryliteProjectConfig(root, server, configPath)
  const storyFiles = await resolveStoryFiles(root, config.stories ?? defaultConfig.stories)
  const cssFiles = resolveFiles(root, config.css ?? [])
  const setupFile = config.setup ? resolveFile(root, config.setup) : null
  const rendererAdapters = resolveRendererAdapters(root, config.renderers ?? [])
  const storyIdResolver = typeof config.storyId === 'function' ? config.storyId : null
  const customization = await resolveStoryliteCustomization(root, config)
  const home = await loadHome(root, config.home, configPath)

  return {
    projectRoot: root,
    configPath,
    storyFiles,
    cssFiles,
    setupFile,
    rendererAdapters,
    storyIdResolver,
    storyIdResolverSource: storyIdResolver ? storyIdResolver.toString() : null,
    home,
    ui: customization.projectUi,
    manager: customization.manager,
    preview: customization.preview,
  }
}

export async function loadStoryliteProjectConfig(
  root,
  server = null,
  configPath = findConfigPath(root),
) {
  return configPath ? await loadStoryliteConfig(root, configPath, server) : defaultConfig
}

export async function resolveStoryliteRendererPlugins(
  config,
  context = { target: 'manager', command: 'serve', projectRoot: process.cwd() },
) {
  const adapters = normalizeRendererAdapters(config.renderers ?? [])
  const pluginLists = await Promise.all(
    adapters.map(async (adapter) => {
      if (typeof adapter.vitePlugins !== 'function') {
        return []
      }

      const plugins = await adapter.vitePlugins(context)
      return Array.isArray(plugins) ? plugins : [plugins]
    }),
  )

  return pluginLists.flat().filter(Boolean)
}

export async function resolveStoryliteProjectPlugins(
  config,
  context = { target: 'manager', command: 'serve', projectRoot: process.cwd() },
) {
  const configured = config.vitePlugins

  if (!configured) {
    return []
  }

  const plugins = typeof configured === 'function' ? await configured(context) : configured
  return Array.isArray(plugins) ? plugins.flat().filter(Boolean) : []
}

export function generateProjectModuleCode(manifest, options = {}) {
  const storyImports =
    options.includeStoryModules === false
      ? ''
      : manifest.storyFiles
          .map(
            (file, index) =>
              `import * as storyModule${index} from ${JSON.stringify(fileUrl(file))};`,
          )
          .join('\n')
  const storyMap =
    options.includeStoryModules === false
      ? ''
      : manifest.storyFiles
          .map(
            (file, index) =>
              `${JSON.stringify(relative(manifest.projectRoot, file))}: storyModule${index}`,
          )
          .join(',\n')
  const cssImports = manifest.cssFiles
    .map((file, index) => `import css${index} from ${JSON.stringify(`${fileUrl(file)}?inline`)};`)
    .join('\n')
  const cssList = manifest.cssFiles.map((_, index) => `css${index}`).join(', ')
  const setupImport = manifest.setupFile
    ? `import { setupPreview as importedSetupPreview } from ${JSON.stringify(fileUrl(manifest.setupFile))};`
    : 'const importedSetupPreview = undefined;'
  const rendererClientLoaders =
    options.includeRendererClientLoaders === false
      ? ''
      : manifest.rendererAdapters
          .map(
            (adapter) =>
              `${JSON.stringify(adapter.name)}: () => import(${JSON.stringify(adapter.clientImport)})`,
          )
          .join(',\n')

  return `${storyImports}
${cssImports}
${setupImport}

export const projectRoot = ${JSON.stringify(manifest.projectRoot)};
export const storyModules = {
${storyMap}
};
export const globalCss = [${cssList}];
export const setupPreview = importedSetupPreview;
export const storyIdResolver = ${formatFunctionExport(manifest.storyIdResolverSource)};
export const rendererClientLoaders = {
${rendererClientLoaders}
};
export const projectUi = ${JSON.stringify(manifest.ui)};
export const previewHtml = ${JSON.stringify(manifest.preview)};
export const managerHtml = ${JSON.stringify(manifest.manager)};
export const home = ${JSON.stringify(manifest.home)};
export const staticStoriesBase = ${JSON.stringify('./stories/')};`
}

export function fileUrl(file) {
  return `/@fs${file}`
}

export function storyPagePath(storyId) {
  return `stories/${storyId}/index.html`
}

export async function parseHomeMarkdown(source, filename = 'home.md') {
  const compiledMarkdown = await compileMdsvex(source, {
    extensions: ['.md'],
  })
  const compiledSvelte = compileSvelte(compiledMarkdown.code, {
    filename,
    generate: 'server',
  })
  const moduleCode = compiledSvelte.js.code.replace(
    "from 'svelte/internal/server'",
    `from ${JSON.stringify(import.meta.resolve('svelte/internal/server'))}`,
  )
  const module = await import(
    `data:text/javascript;charset=utf-8,${encodeURIComponent(moduleCode)}`
  )
  const { body } = renderSvelte(module.default)

  return {
    frontmatter: normalizeFrontmatter(module.metadata ?? compiledMarkdown.data?.fm),
    html: body,
  }
}

function findConfigPath(root) {
  const tsPath = resolve(root, '.storylite/config.ts')
  const jsPath = resolve(root, '.storylite/config.js')
  return existsSync(tsPath) ? tsPath : existsSync(jsPath) ? jsPath : null
}

async function loadStoryliteConfig(root, configPath, server) {
  if (server) {
    try {
      const moduleId = `${fileUrl(configPath)}?storylite-config=${Date.now()}`
      const module = await server.ssrLoadModule(moduleId)
      return module.default ?? module.config ?? defaultConfig
    } catch (error) {
      server.ssrFixStacktrace?.(error)
    }
  }

  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: process.env.NODE_ENV ?? 'development' },
    configPath,
    root,
  )
  return loaded?.config ?? defaultConfig
}

function resolveRendererAdapters(root, renderers) {
  return normalizeRendererAdapters(renderers).map((adapter) => ({
    name: adapter.name,
    clientImport: resolveImport(root, adapter.client),
    staticImport: adapter.static ? resolveImport(root, adapter.static) : null,
  }))
}

function normalizeRendererAdapters(renderers) {
  const seen = new Set()
  const adapters = []

  for (const adapter of renderers) {
    if (!isRecord(adapter)) {
      continue
    }

    const name = typeof adapter.name === 'string' ? adapter.name.trim() : ''
    const client = typeof adapter.client === 'string' ? adapter.client.trim() : ''
    const staticRenderer = typeof adapter.static === 'string' ? adapter.static.trim() : null

    if (!name || !client) {
      throw new Error('StoryLite renderer adapters need a non-empty name and client entry.')
    }

    if (builtinRenderers.has(name)) {
      throw new Error(`StoryLite renderer adapter "${name}" cannot override a built-in renderer.`)
    }

    if (seen.has(name)) {
      throw new Error(`StoryLite renderer adapter "${name}" is registered more than once.`)
    }

    seen.add(name)
    adapters.push({ ...adapter, name, client, static: staticRenderer })
  }

  return adapters
}

function resolveImport(root, specifier) {
  if (isAbsolute(specifier) || specifier.startsWith('.')) {
    return fileUrl(resolveFile(root, specifier))
  }

  const require = createRequire(resolve(root, 'package.json'))
  return fileUrl(require.resolve(specifier, { paths: [root] }))
}

async function resolveStoryFiles(root, patterns) {
  const matches = await fg(patterns, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
  })
  return matches.sort()
}

function resolveFiles(root, files) {
  return files.map((file) => resolveFile(root, file))
}

function resolveFile(root, file) {
  return isAbsolute(file) ? file : resolve(root, file)
}

async function loadHome(root, inlineHome, configPath = null) {
  if (typeof inlineHome === 'string') {
    return {
      path: configPath ?? resolve(root, '.storylite/config.ts'),
      ...(await parseHomeMarkdown(inlineHome, 'config-home.md')),
    }
  }

  const path = resolve(root, '.storylite/home.md')

  if (!existsSync(path)) {
    return null
  }

  return {
    path,
    ...(await parseHomeMarkdown(await readFile(path, 'utf8'), path)),
  }
}

function isProjectFile(root, file) {
  const normalized = relative(root, file).replaceAll('\\', '/')
  return (
    normalized.startsWith('.storylite/') ||
    normalized.includes('.stories.') ||
    normalized.endsWith('.md') ||
    normalized.endsWith('.css') ||
    normalized.endsWith('.html') ||
    normalized.endsWith('.tsx') ||
    normalized.endsWith('.ts')
  )
}

function normalizeFrontmatter(value) {
  return isRecord(value) ? value : {}
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function formatFunctionExport(source) {
  if (!source) {
    return 'undefined'
  }

  const trimmed = source.trim()

  if (/^[A-Za-z_$][\w$]*\s*\(/.test(trimmed)) {
    return `(function ${trimmed})`
  }

  return `(${trimmed})`
}
