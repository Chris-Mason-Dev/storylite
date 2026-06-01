---
name: storylite-create-story
description:
  Create StoryLite component stories in consumer projects that use StoryLite public packages,
  explaining StoryLite's CSF-like story format with examples from single-story files to advanced
  args, argTypes, renderers, parameters, render context, CSS, and web components.
metadata:
  short-description: Create StoryLite CSF-like stories
---

# StoryLite Create Story

Use this skill when creating or updating StoryLite story modules in any project that uses the public
StoryLite packages.

Do not assume the StoryLite source repository is present. Work from the consuming project's files,
the installed public package API, and StoryLite's public documentation.

## Public Documentation

When current StoryLite behavior or setup details matter, read these public docs before deciding:

- LLM guidance: `https://context7.com/itsjavi/storylite/llms.txt?tokens=10000`
- README: `https://raw.githubusercontent.com/itsjavi/storylite/main/README.md`

Prefer the `llms.txt` file for agent-oriented guidance when available, then use the raw README for
installation, configuration, renderer adapters, and story-format details. If network access is not
available, continue with the format summary and examples in this skill.

## Workflow

1. Inspect the consumer project for `.storylite/config.ts`, configured story globs, installed
   `@storylite/*` packages, and nearby `*.stories.ts` or `*.stories.tsx` files.
2. Match the consuming project's import style, renderer, naming, file extension, and CSS strategy.
3. Import public StoryLite types from `@storylite/storylite`: `StoryLiteMeta`,
   `StoryLiteStoryDefinition`, and when useful `StoryLiteParameters` or `StoryLiteRender`.
4. Define a narrow `Args` type for each story or component group. Prefer string literal unions for
   select controls.
5. Add a default export with shared `title`, optional `component`, shared `args`, shared `argTypes`,
   and shared `parameters`.
6. Add named story exports as objects. Use `export const Default = { ... }` for a file with one
   primary story. Each export may provide `name`, `component`, `args`, `argTypes`, `parameters`,
   `render`, and `source`.
7. Keep examples practical: start with the default state, then add meaningful variants such as
   disabled, long content, error state, density, layout, or integration behavior.
8. Do not add unsupported Storybook features. StoryLite stories do not support `play`, loaders,
   decorators, docs/autodocs, actions, addon APIs, or arbitrary toolbar callbacks.

## StoryLite CSF-Like Format

Default export fields:

- `title`: Sidebar group title.
- `component`: Optional component reference, or a custom element tag name for web components.
- `args`: Default args merged into every story.
- `argTypes`: Control metadata merged into every story.
- `parameters`: Default story parameters merged into every story.
- `source`: Optional code snippet override string or callback.

Named story export fields:

- `name`: Optional display name. Defaults to a label derived from the export name.
- `component`: Optional story-specific component override.
- `args`: Args merged over default export args.
- `argTypes`: Arg type metadata merged over default export arg types.
- `parameters`: Parameters merged over default export parameters.
- `render(args, context)`: Story render function.
- `source`: Optional story-specific snippet string or callback.

`source` may be a literal string or a callback with the signature
`(args, context) => string | null | undefined`. Use a string for fixed snippets and a callback when
the snippet should reflect current control values or story context.

Use a single `Default` export when a story file has one primary state. When a component has exactly
one story export, StoryLite shows it as one sidebar link instead of a component row plus a story
row. A generated `Default` story uses the component title as the link label; a single story with
another export or display name uses that story name. Keep the default export for metadata; do not
put the story itself in `export default`.

Supported controls: `boolean`, `text`, `textarea`, `number`, `color`, and `select`. Controls may be
declared as strings, such as `{ control: 'text' }`, or objects, such as
`{ control: { type: 'select' }, options: ['primary', 'secondary'] }`. If no control is provided,
StoryLite infers a simple control from the current arg value.

Supported parameters:

- `renderer`: `html`, `web-components`, or an adapter renderer such as `react`, `preact`, `svelte`,
  `vue`, or `solid`.
- `css`: Per-story CSS string or array of strings.
- `background`: Initial preview background value.
- `defineCustomElements(window)`: Registers custom elements in the preview window.

`render(args, context)` receives `id`, `title`, `name`, `canvas`, `document`, and `window`. HTML
stories may return a string, `Node`, or `DocumentFragment`. Framework adapter stories usually return
framework output from `render`; web component stories can often omit `render` and use `component`
plus args.

## Reference Examples

Read [references/story-examples.md](references/story-examples.md) when you need copyable examples
from easy to advanced. It covers:

- Minimal HTML stories.
- Shared defaults and merged per-story overrides.
- All controls and both `argTypes` declaration styles.
- Per-story `parameters.css`, `parameters.background`, and `parameters.renderer`.
- `render(args, context)` with DOM APIs.
- React-style adapter rendering.
- Web component stories with `component` and `defineCustomElements`.
