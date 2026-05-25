# Contributing

Thanks for taking the time to contribute.

## Requirements

- Node.js 24 or newer.
- pnpm 11.2.2. The exact version is recorded in `package.json`.

Install dependencies from the repository root:

```sh
pnpm install
```

## Repository Layout

- `packages/*`: published StoryLite packages and renderer adapters.
- `apps/web`: the StoryLite demo site published to GitHub Pages.
- `apps/e2e`: Playwright end-to-end tests.
- `demos/*`: framework demos for HTML, React, Svelte, Vue, and Solid.

## Common Commands

```sh
# Start every dev server
pnpm dev

# Start only the web demo
pnpm dev:web

# Build everything
pnpm build

# Build packages only
pnpm build:packages

# Build the web demo only
pnpm build:web

# Typecheck all workspaces
pnpm typecheck

# Check formatting
pnpm format:check

# Format files
pnpm format

# Run unit tests
pnpm test

# Run Playwright e2e tests
pnpm test:e2e

# Run the full local QA sequence
pnpm qa
```

## Testing

Unit tests use Vitest. End-to-end tests use Playwright.

Before running e2e tests for the first time, install Chromium:

```sh
pnpm -F @storylite/e2e run e2e:install
```

Run package-specific scripts with pnpm filters when you only need one workspace:

```sh
pnpm -F @storylite/web run test
pnpm -F @storylite/storylite run typecheck
```

## Commits

Use Conventional Commit messages:

```txt
feat(renderer-react): add static story rendering
fix(cli): preserve configured base path in static output
docs(readme): update install instructions
```
