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

```sh
pnpm add -D @storylite/storylite
```

Add adapter packages only for the frameworks you use:

```sh
pnpm add -D @storylite/renderer-react
pnpm add -D @storylite/renderer-preact
pnpm add -D @storylite/renderer-svelte
pnpm add -D @storylite/renderer-vue
pnpm add -D @storylite/renderer-solid
```

Install the framework peers required by each adapter, such as `react` and `react-dom` for React.

## CLI

```sh
storylite dev
storylite build
storylite preview
```

## Documentation

- [Quick start](https://github.com/itsjavi/storylite#quick-start)
- [Framework adapters](https://github.com/itsjavi/storylite#framework-adapters)
- [Story format](https://github.com/itsjavi/storylite#story-format)
- [Source snippets](https://github.com/itsjavi/storylite#source-snippets)
- [Static output](https://github.com/itsjavi/storylite#storylite-build)

## Source Snippets

The `Copy snippet` action appears when a story has an explicit `source`, a copyable web-component
tag, or a framework renderer plus stable component metadata. Framework adapter registration alone
does not select a renderer for every story. See
[Source snippets](https://github.com/itsjavi/storylite#source-snippets) for the exact conditions.

## Links

- Repository: [github.com/itsjavi/storylite](https://github.com/itsjavi/storylite)
- Demo site: [itsjavi.com/storylite](https://itsjavi.com/storylite)
- Issues: [github.com/itsjavi/storylite/issues](https://github.com/itsjavi/storylite/issues)
