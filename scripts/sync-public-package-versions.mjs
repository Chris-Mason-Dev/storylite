#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const shouldStage = process.argv.includes('--stage')
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = path.join(repoRoot, 'packages')
const sourcePackagePath = path.join(packagesDir, 'storylite', 'package.json')
const sourcePackage = JSON.parse(await readFile(sourcePackagePath, 'utf8'))
const nextVersion = sourcePackage.version

if (!nextVersion) {
  throw new Error(`Missing version in ${path.relative(repoRoot, sourcePackagePath)}`)
}

const entries = await readdir(packagesDir, { withFileTypes: true })
const updatedPackages = []
const updatedPackagePaths = []

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name === 'storylite') {
    continue
  }

  const packagePath = path.join(packagesDir, entry.name, 'package.json')
  let packageJson

  try {
    packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      continue
    }

    throw error
  }

  if (
    packageJson.private === true ||
    packageJson.publishConfig?.access !== 'public' ||
    !packageJson.name?.startsWith('@storylite/')
  ) {
    continue
  }

  if (packageJson.version === nextVersion) {
    continue
  }

  packageJson.version = nextVersion
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
  updatedPackages.push(packageJson.name)
  updatedPackagePaths.push(path.relative(repoRoot, packagePath))
}

if (updatedPackages.length === 0) {
  console.log(`Public package versions already match ${nextVersion}`)
  process.exit(0)
}

console.log(`Synced ${nextVersion} to ${updatedPackages.join(', ')}`)

if (shouldStage) {
  const result = spawnSync('git', ['add', '--', ...updatedPackagePaths], {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
