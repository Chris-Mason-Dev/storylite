#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { createServer, build, preview } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { transformManagerHtml } from './customization.mjs'
import { isBareImportSpecifier } from '../src/lib/storylite/utils.js'
import {
  createProjectGraph,
  generateProjectModuleCode,
  loadStoryliteProjectConfig,
  resolvedVirtualProjectId,
  resolveStoryliteProjectPlugins,
  resolveStoryliteRendererPlugins,
  virtualProjectId,
} from './project-graph.mjs'
import { emitStaticStoryPages, injectPrerenderedStoryLiteShell } from './static-build.mjs'

const storyliteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appRoot = storyliteDir
const entryServer = resolve(appRoot, 'src/entry-server.ts')
const projectRoot = process.cwd()
const rawArgs = process.argv.slice(2)
const command = rawArgs[0]
const knownCommands = new Set(['dev', 'build', 'preview'])
const helpRequested = rawArgs.includes('--help') || rawArgs.includes('-h')

if (!command || helpRequested) {
  printHelp()
  process.exit(0)
}

if (!knownCommands.has(command)) {
  console.error(`Unknown StoryLite command "${command}".`)
  console.error('')
  printHelp()
  process.exit(1)
}

const { values: cliOptions, tokens: cliTokens } = parseArgs({
  args: rawArgs.slice(1),
  options: {
    base: { type: 'string' },
    host: { type: 'boolean' },
    port: { type: 'string' },
  },
  strict: false,
  allowPositionals: true,
  tokens: true,
})
const port = readPortOption()
const host = readHostOption(command === 'preview')

if (command === 'dev') {
  const graph = createProjectGraph(projectRoot)
  const manifest = await graph.load()
  const vitePlugins = await loadVitePlugins(projectRoot, {
    command: 'serve',
    target: 'manager',
  })
  const server = await createServer({
    configFile: false,
    root: appRoot,
    publicDir: manifest.publicDir,
    plugins: [svelte(), ...vitePlugins, storylitePlugin(projectRoot, graph)],
    optimizeDeps: createDependencyOptimizationConfig(manifest),
    server: {
      port,
      host,
      fs: {
        allow: [appRoot, projectRoot, resolve(projectRoot, '..'), resolve(projectRoot, '../..')],
      },
    },
  })
  await server.listen()
  server.printUrls()
  server.bindCLIShortcuts({ print: true })
} else if (command === 'build') {
  const graph = createProjectGraph(projectRoot)
  const manifest = await graph.load()
  const managerPlugins = await loadVitePlugins(projectRoot, {
    command: 'build',
    target: 'manager',
  })
  const prerenderPlugins = await loadVitePlugins(projectRoot, {
    command: 'build',
    target: 'prerender',
  })
  const base = readBaseOption()
  const outDir = resolve(projectRoot, 'dist-storylite')
  const prerenderOutDir = resolve(outDir, '.storylite-prerender')

  await build({
    configFile: false,
    root: appRoot,
    base,
    publicDir: manifest.publicDir,
    plugins: [svelte(), ...managerPlugins, storylitePlugin(projectRoot, graph)],
    build: {
      outDir,
      emptyOutDir: true,
    },
  })

  await build({
    configFile: false,
    root: appRoot,
    base,
    publicDir: false,
    plugins: [
      svelte(),
      ...prerenderPlugins,
      storylitePlugin(projectRoot, graph, {
        includeRendererClientLoaders: false,
        includeStoryModules: false,
      }),
    ],
    ssr: {
      noExternal: true,
    },
    build: {
      outDir: prerenderOutDir,
      emptyOutDir: true,
      copyPublicDir: false,
      ssr: entryServer,
      rolldownOptions: {
        output: {
          entryFileNames: 'entry-server.js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  })

  await injectPrerenderedStoryLiteShell({
    outDir,
    prerenderOutDir,
    managerCss: (await graph.load()).ui.css,
  })

  const staticPlugins = await loadVitePlugins(projectRoot, {
    command: 'build',
    target: 'static',
  })
  const staticStoryPlugins = manifest.rendererAdapters.some((adapter) => adapter.name === 'svelte')
    ? [svelte(), ...staticPlugins]
    : staticPlugins

  await emitStaticStoryPages({
    appRoot,
    projectRoot,
    outDir,
    base,
    graph,
    rendererPlugins: staticStoryPlugins,
  })
} else if (command === 'preview') {
  const base = readBaseOption()
  const server = await preview({
    configFile: false,
    root: projectRoot,
    base,
    build: {
      outDir: resolve(projectRoot, 'dist-storylite'),
    },
    preview: {
      port,
      host,
    },
  })
  server.printUrls()
}

function printHelp() {
  console.log(`StoryLite

Usage:
  storylite <command> [options]
  storylite --help

Commands:
  dev      Start the managed Vite development server
  build    Build static output into dist-storylite
  preview  Serve dist-storylite with Vite preview

Options:
  -h, --help       Show this help message

Dev options:
  --port <port>    Dev server port (default: 3993, or PORT)
  --host [host]    Host to listen on; omit the value to expose on all hosts

Build options:
  --base <path>    Public base path for generated URLs (default: ./, or STORYLITE_BASE)

Preview options:
  --port <port>    Preview server port (default: 3993, or PORT)
  --host [host]    Host to listen on (default: all hosts)
  --base <path>    Public base path while serving built output (default: ./, or STORYLITE_BASE)`)
}

function storylitePlugin(root, graph = createProjectGraph(root), options = {}) {
  return {
    name: 'storylite-project',
    configureServer(server) {
      graph.setServer(server)
      server.watcher.add(resolve(root, '.storylite'))
    },
    resolveId(id) {
      if (id === virtualProjectId) {
        return resolvedVirtualProjectId
      }
      return null
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const manifest = await graph.load()
        return transformManagerHtml(html, manifest.manager)
      },
    },
    async handleHotUpdate(context) {
      if (!graph.isProjectFile(context.file)) {
        return undefined
      }

      graph.invalidate()
      const module = context.server.moduleGraph.getModuleById(resolvedVirtualProjectId)

      if (module) {
        context.server.moduleGraph.invalidateModule(module, new Set(), context.timestamp, true)
      }

      if (graph.shouldFullReload(context.file)) {
        context.server.ws.send({ type: 'full-reload' })
        return []
      }

      return module ? [module] : []
    },
    async load(id) {
      if (id !== resolvedVirtualProjectId) {
        return null
      }

      return generateProjectModuleCode(await graph.load({ force: true }), options)
    },
  }
}

function readBaseOption() {
  return cliOptions.base || process.env.STORYLITE_BASE || './'
}

function readHostOption(defaultValue = false) {
  const hostValue = readHostCliValue()

  if (hostValue === undefined) {
    return process.env.EXPOSE_HOST === '1' || process.env.EXPOSE_HOST === 'true' || defaultValue
  }

  return hostValue
}

function readPortOption() {
  const value = cliOptions.port ?? process.env.PORT ?? '3993'
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
    throw new Error(`Invalid --port value: ${value}`)
  }

  return parsed
}

function readHostCliValue() {
  const hostTokens = cliTokens.filter((token) => token.kind === 'option' && token.name === 'host')
  const hostToken = hostTokens.at(-1)

  if (!hostToken) {
    return undefined
  }

  if (hostToken.value !== undefined) {
    return hostToken.value
  }

  const nextToken = cliTokens.find((token) => token.index === hostToken.index + 1)
  return nextToken?.kind === 'positional' ? nextToken.value : true
}

async function loadVitePlugins(root, context) {
  const config = await loadStoryliteProjectConfig(root)
  const resolvedContext = {
    projectRoot: root,
    ...context,
  }
  const projectPlugins = await resolveStoryliteProjectPlugins(config, resolvedContext)
  const rendererPlugins = await resolveStoryliteRendererPlugins(config, resolvedContext)
  return [...projectPlugins, ...rendererPlugins]
}

function createDependencyOptimizationConfig(manifest) {
  const include = collectDependencyOptimizationIncludes(manifest)

  return include.length ? { entries: [], include } : { entries: [] }
}

function collectDependencyOptimizationIncludes(manifest) {
  const specifiers = new Set()

  for (const adapter of manifest.rendererAdapters) {
    addBareImportSpecifier(specifiers, adapter.clientImport)
  }

  return Array.from(specifiers).sort()
}

function addBareImportSpecifier(specifiers, specifier) {
  if (typeof specifier === 'string' && isBareImportSpecifier(specifier)) {
    specifiers.add(specifier)
  }
}
