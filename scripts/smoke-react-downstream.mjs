import { readdir, readFile, rm, writeFile, mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const keepArtifacts = process.env.STORYLITE_KEEP_SMOKE_APP === '1'

const packages = [
  { name: '@storylite/contracts', dir: 'packages/contracts' },
  { name: '@storylite/preview-host', dir: 'packages/preview-host' },
  { name: '@storylite/renderer-react', dir: 'packages/renderer-react' },
  { name: '@storylite/storylite', dir: 'packages/storylite' },
]

const packageBuilds = [
  '@storylite/contracts',
  '@storylite/preview-host',
  '@storylite/renderer-react',
  '@storylite/storylite',
]

const tarballDir = await mkdtemp(join(tmpdir(), 'storylite-react-smoke-tarballs-'))
const appRoot = await mkdtemp(join(tmpdir(), 'storylite-react-smoke-'))

try {
  for (const packageName of packageBuilds) {
    await run(pnpm, ['-F', packageName, 'run', 'build'])
  }

  const packageInfo = await Promise.all(
    packages.map(async (entry) => {
      const packageDir = join(repoRoot, entry.dir)
      const packageJson = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'))
      const tarball = join(tarballDir, packedFileName(packageJson))

      await run(pnpm, ['pack', '--pack-destination', tarballDir], { cwd: packageDir })

      return {
        ...entry,
        version: packageJson.version,
        tarball,
      }
    }),
  )

  const tarballs = new Map(packageInfo.map((entry) => [entry.name, entry.tarball]))
  await writeSmokeProject(appRoot, packageInfo, tarballs)

  await run(pnpm, ['install', '--force'], { cwd: appRoot })
  await run(pnpm, ['run', 'build'], { cwd: appRoot })

  const projectCode = await readFile(join(appRoot, 'dist-storylite/project.js'), 'utf8')
  const managerCode = await readAllJs(join(appRoot, 'dist-storylite/storylite-assets'))

  assert(
    /["']?metaComponentName["']?\s*:\s*[`'"]Card[`'"]/.test(projectCode),
    'Expected the downstream build to include meta component source metadata for Card.',
  )
  assert(
    /["']?storyComponentNames["']?\s*:\s*\{[\s\S]*?["']?FromRender["']?\s*:\s*[`'"]Card[`'"]/.test(
      projectCode,
    ),
    'Expected the downstream build to include render JSX source metadata for FromRender.',
  )
  assert(
    managerCode.includes('Copy snippet'),
    'Expected the built manager bundle to include the Copy snippet action.',
  )
  assert(
    managerCode.includes('sourceComponentName'),
    'Expected the built manager bundle to read source component metadata.',
  )

  console.log('\nReact downstream smoke passed.')
} finally {
  if (keepArtifacts) {
    console.log(`\nSmoke app: ${appRoot}`)
    console.log(`Tarballs: ${tarballDir}`)
  } else {
    await Promise.all([
      rm(appRoot, { force: true, recursive: true }),
      rm(tarballDir, { force: true, recursive: true }),
    ])
  }
}

async function writeSmokeProject(root, packageInfo, tarballs) {
  await mkdir(join(root, '.storylite'), { recursive: true })
  await mkdir(join(root, 'src'), { recursive: true })

  const versionByName = new Map(packageInfo.map((entry) => [entry.name, entry.version]))

  await writeJson(join(root, 'package.json'), {
    name: 'storylite-react-downstream-smoke',
    private: true,
    type: 'module',
    scripts: {
      build: 'storylite build',
    },
    dependencies: {
      '@storylite/renderer-react': fileDependency(tarballs.get('@storylite/renderer-react')),
      '@storylite/storylite': fileDependency(tarballs.get('@storylite/storylite')),
      react: '^19.2.6',
      'react-dom': '^19.2.6',
    },
    devDependencies: {
      '@types/react': '^19.2.15',
      '@types/react-dom': '^19.2.3',
      typescript: '^6.0.3',
    },
  })

  await writeFile(
    join(root, 'pnpm-workspace.yaml'),
    `minimumReleaseAgeExclude:
${packageInfo.map((entry) => `  - '${entry.name}@${versionByName.get(entry.name)}'`).join('\n')}

overrides:
${packageInfo.map((entry) => `  '${entry.name}': ${fileDependency(entry.tarball)}`).join('\n')}
`,
  )

  await writeFile(
    join(root, 'tsconfig.json'),
    `{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "target": "ES2022",
    "types": ["react", "react-dom"]
  },
  "include": ["src", ".storylite"]
}
`,
  )

  await writeFile(
    join(root, '.storylite/config.ts'),
    `import { defineConfig } from '@storylite/storylite'
import react from '@storylite/renderer-react'

export default defineConfig({
  stories: ['./src/**/*.stories.tsx'],
  renderers: [react()],
})
`,
  )

  await writeFile(
    join(root, 'src/Card.tsx'),
    `export type CardProps = {
  eyebrow?: string
  title: string
  body: string
}

export function Card({ eyebrow, title, body }: CardProps) {
  return (
    <article>
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2>{title}</h2>
      <p>{body}</p>
    </article>
  )
}
`,
  )

  await writeFile(
    join(root, 'src/Card.stories.tsx'),
    `import { createElement } from 'react'
import { Card } from './Card'

export default {
  title: 'Smoke/Card',
  component: Card,
  parameters: { renderer: 'react' },
}

export const FromMeta = {
  args: {
    eyebrow: 'Smoke',
    title: 'Meta component',
    body: 'The copy button should appear without an explicit source option.',
  },
  render: (args) => createElement(Card, args),
}
`,
  )

  await writeFile(
    join(root, 'src/RenderOnly.stories.tsx'),
    `import { Card } from './Card'

export default {
  title: 'Smoke/Render only',
  parameters: { renderer: 'react' },
}

export const FromRender = {
  args: {
    eyebrow: 'Smoke',
    title: 'Render component',
    body: 'Render-only JSX should still infer the source component name.',
  },
  render: (args) => <Card {...args} />,
}
`,
  )
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`)
}

function packedFileName(packageJson) {
  return `${packageJson.name.replace(/^@/, '').replaceAll('/', '-')}-${packageJson.version}.tgz`
}

function fileDependency(file) {
  return `file:${file.replaceAll('\\', '/')}`
}

async function readAllJs(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const chunks = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name)

      if (entry.isDirectory()) {
        return readAllJs(path)
      }

      if (!entry.isFile() || !entry.name.endsWith('.js')) {
        return ''
      }

      return readFile(path, 'utf8')
    }),
  )

  return chunks.join('\n')
}

async function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(' ')}`)

  const child = spawn(command, args, {
    cwd: options.cwd ?? repoRoot,
    stdio: 'inherit',
  })

  const code = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
  })

  if (code !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${code}`)
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}
