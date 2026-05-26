# @storylite/storylite

<p style="display: flex; gap: 10px;">
  <a href="https://npmjs.com/package/@storylite/storylite"><img src="https://img.shields.io/npm/v/@storylite/storylite.svg" alt="npm package"></a>
  <a href="https://bundlephobia.com/package/@storylite/storylite"><img src="https://img.shields.io/bundlephobia/min/@storylite/storylite?label=@storylite/storylite" alt="bundlephobia" /></a>
  <a href="https://github.com/itsjavi/storylite"><img src="https://img.shields.io/badge/GitHub-storylite-24292f" alt="GitHub repository" /></a>
</p>

StoryLite is a lightweight, Vite-powered alternative to Storybook for building and showcasing
component stories in HTML, web components, React, Preact, Svelte, Vue, and Solid.

It provides a managed app shell, isolated preview iframe, story controls, static output, and
optional framework renderer adapters without the full Storybook addon platform.

[GitHub](https://github.com/itsjavi/storylite) ·
[Full documentation](https://github.com/itsjavi/storylite#readme) ·
[Demo site](https://itsjavi.com/storylite)

![StoryLite](https://raw.githubusercontent.com/itsjavi/storylite/main/screenshot.png)

## Highlights

- Managed CLI app: run `storylite dev`, `storylite build`, and `storylite preview`.
- Built-in renderers for `html` and `web-components`.
- Optional adapters for React, Preact, Svelte, Vue, and Solid.
- CSF-like story files with `args`, `argTypes`, controls, and per-story parameters.
- Static build with a prerendered manager shell and one static page per story.
- Project customization for branding, backgrounds, viewports, toolbar tools, menu links, HTML hooks,
  home content, and Vite plugins.

## Install

Install StoryLite in the package that owns your stories:

```sh
pnpm add -D @storylite/storylite
```

Add a framework adapter only when you need one:

```sh
pnpm add -D @storylite/renderer-react
pnpm add -D @storylite/renderer-preact
pnpm add -D @storylite/renderer-svelte
pnpm add -D @storylite/renderer-vue
pnpm add -D @storylite/renderer-solid
```

Renderer adapters keep framework-specific tooling out of `@storylite/storylite`. Install the
framework peers only for adapters you configure; for example React projects install `react` and
`react-dom`, Svelte projects install `svelte`, and Vue/Solid projects install their renderer package
plus the Vite plugin peer listed by that package.

Add scripts:

```json
{
  "scripts": {
    "storylite": "storylite dev",
    "storylite:build": "storylite build",
    "storylite:preview": "storylite preview"
  }
}
```

## Quick Start

Create `.storylite/config.ts`:

```ts
import { defineConfig } from '@storylite/storylite'

export default defineConfig({
  stories: ['./src/**/*.stories.ts'],
  css: ['./src/styles.css'],
})
```

Create a story:

```ts
import type { StoryLiteMeta, StoryLiteStoryDefinition } from '@storylite/storylite'

export default {
  title: 'Components/Button',
} satisfies StoryLiteMeta

export const Primary = {
  args: {
    label: 'Save changes',
  },
  argTypes: {
    label: { control: 'text' },
  },
  render: (args) => `<button>${args.label}</button>`,
} satisfies StoryLiteStoryDefinition<{ label: string }>
```

Run StoryLite:

```sh
pnpm storylite
```

Build static output:

```sh
pnpm storylite:build
```

`storylite build` writes `dist-storylite/index.html` plus one default-args static page per story at
`dist-storylite/stories/<story-id>/index.html`.

## CLI

```sh
storylite dev --port 4103 --host 127.0.0.1
storylite build --base /docs/
storylite preview --port 4103 --base /docs/
```

## Framework Adapters

StoryLite ships built-in support for HTML strings, DOM nodes, document fragments, and custom
elements. Framework support is opt-in:

```ts
import { defineConfig } from '@storylite/storylite'
import react from '@storylite/renderer-react'

export default defineConfig({
  stories: ['./src/**/*.stories.tsx'],
  css: ['./src/styles.css'],
  renderers: [react()],
})
```

Adapters own their client renderer, optional static renderer, and adapter-specific Vite plugins.
Changing renderer adapters in `.storylite/config.ts` requires restarting `storylite dev`.

## Links

- Repository: [github.com/itsjavi/storylite](https://github.com/itsjavi/storylite)
- Full README: [github.com/itsjavi/storylite#readme](https://github.com/itsjavi/storylite#readme)
- Issues: [github.com/itsjavi/storylite/issues](https://github.com/itsjavi/storylite/issues)
