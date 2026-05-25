import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import { defineRenderer } from '@storylite/contracts'

export default function preactRenderer() {
  return defineRenderer({
    name: 'preact',
    client: '@storylite/renderer-preact/client',
    static: '@storylite/renderer-preact/static',
    vitePlugins: async (context) => {
      const { default: preact } = await import('@preact/preset-vite')
      const needsProjectRuntime = context.target === 'manager' && context.command === 'serve'

      return [
        needsProjectRuntime ? preactProjectRuntimePlugin(context.projectRoot) : null,
        preact(),
      ].filter(Boolean)
    },
  })
}

function preactProjectRuntimePlugin(projectRoot: string) {
  const requireFromProject = createRequire(`${projectRoot}/package.json`)
  const preactPackageRoot = dirname(requireFromProject.resolve('preact/package.json'))

  return {
    name: 'storylite-preact-project-runtime',
    config() {
      return {
        resolve: {
          alias: [
            { find: /^preact$/, replacement: `${preactPackageRoot}/dist/preact.module.js` },
            {
              find: /^preact\/jsx-runtime$/,
              replacement: `${preactPackageRoot}/jsx-runtime/dist/jsxRuntime.module.js`,
            },
            {
              find: /^preact\/jsx-dev-runtime$/,
              replacement: `${preactPackageRoot}/jsx-runtime/dist/jsxRuntime.module.js`,
            },
            {
              find: /^preact\/debug$/,
              replacement: `${preactPackageRoot}/debug/dist/debug.module.js`,
            },
            {
              find: /^preact\/devtools$/,
              replacement: `${preactPackageRoot}/devtools/dist/devtools.module.js`,
            },
            {
              find: /^preact\/hooks$/,
              replacement: `${preactPackageRoot}/hooks/dist/hooks.module.js`,
            },
            {
              find: /^preact\/compat$/,
              replacement: `${preactPackageRoot}/compat/dist/compat.module.js`,
            },
          ],
        },
      }
    },
  }
}
