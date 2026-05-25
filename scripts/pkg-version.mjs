#!/usr/bin/env node
import { spawn } from 'node:child_process'
import process from 'node:process'

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.error('Usage: pnpm pkg:version <major|minor|patch|version>')
  process.exit(1)
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const child = spawn(
  pnpm,
  ['--filter', '@storylite/storylite', 'version', args[0], '--message', 'chore(release): v%s'],
  {
    stdio: 'inherit',
  },
)

child.on('error', (error) => {
  console.error(error.message)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`pnpm version exited with signal ${signal}`)
    process.exit(1)
  }

  process.exit(code ?? 1)
})
