import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import { defineRenderer } from '@storylite/contracts'

export default function solidRenderer() {
  return defineRenderer({
    name: 'solid',
    client: '@storylite/renderer-solid/client',
    static: '@storylite/renderer-solid/static',
    vitePlugins: async (context) => {
      const { default: solid } = await import('vite-plugin-solid')
      const needsProjectRuntime = context.target === 'manager' && context.command === 'serve'

      return [
        needsProjectRuntime ? solidProjectRuntimePlugin(context.projectRoot) : null,
        solid({
          ssr: context.target === 'static',
        }),
      ].filter(Boolean)
    },
  })
}

function solidProjectRuntimePlugin(projectRoot: string) {
  const requireFromProject = createRequire(`${projectRoot}/package.json`)
  const solidPackageRoot = dirname(requireFromProject.resolve('solid-js/package.json'))

  return {
    name: 'storylite-solid-project-runtime',
    config() {
      return {
        resolve: {
          alias: [
            { find: /^solid-js$/, replacement: `${solidPackageRoot}/dist/dev.js` },
            { find: /^solid-js\/web$/, replacement: `${solidPackageRoot}/web/dist/dev.js` },
            { find: /^solid-js\/store$/, replacement: `${solidPackageRoot}/store/dist/dev.js` },
            { find: /^solid-js\/html$/, replacement: `${solidPackageRoot}/html/dist/html.js` },
            { find: /^solid-js\/h$/, replacement: `${solidPackageRoot}/h/dist/h.js` },
          ],
        },
      }
    },
  }
}
