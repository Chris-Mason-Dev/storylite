# StoryLite Story Examples

These examples are intentionally generic. Adapt import paths, component names, CSS imports, and
renderer names to the target package or app.

## 1. Minimal HTML Default Story

Use this when the component is a plain HTML fragment and needs one editable text arg. For a file
with one primary state, prefer `export const Default = { ... }`; StoryLite shows it as one sidebar
link. If the single story uses another export or display name, StoryLite uses that story name for
the link.

```ts
import type { StoryLiteMeta, StoryLiteStoryDefinition } from '@storylite/storylite'

type ButtonArgs = {
  label: string
}

export default {
  title: 'Components/Button',
  parameters: {
    renderer: 'html',
  },
} satisfies StoryLiteMeta<ButtonArgs>

export const Default = {
  args: {
    label: 'Save changes',
  },
  argTypes: {
    label: { control: 'text' },
  },
  render: (args) => `<button class="button">${args.label}</button>`,
} satisfies StoryLiteStoryDefinition<ButtonArgs>
```

## 2. Shared Defaults With Variants

Use default export `args`, `argTypes`, and `parameters` for behavior every story shares. Named story
exports only override what changes.

```ts
import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import css from './button.css?inline'

type ButtonArgs = {
  label: string
  variant: 'primary' | 'secondary' | 'danger'
  disabled: boolean
}

const parameters: StoryLiteParameters = {
  renderer: 'html',
  css,
}

export default {
  title: 'Components/Button',
  args: {
    variant: 'primary',
    disabled: false,
  },
  argTypes: {
    label: { control: 'text', description: 'Visible button text' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Visual treatment',
    },
    disabled: { control: 'boolean' },
  },
  parameters,
} satisfies StoryLiteMeta<ButtonArgs>

export const Primary = {
  args: {
    label: 'Save changes',
  },
  render: renderButton,
} satisfies StoryLiteStoryDefinition<ButtonArgs>

export const Danger = {
  name: 'Danger action',
  args: {
    label: 'Delete project',
    variant: 'danger',
  },
  parameters: {
    background: '#fff7ed',
  },
  render: renderButton,
} satisfies StoryLiteStoryDefinition<ButtonArgs>

function renderButton(args: ButtonArgs): string {
  return `
    <button class="button button--${args.variant}" ${args.disabled ? 'disabled' : ''}>
      ${args.label}
    </button>
  `
}
```

## 3. All Control Types

Use this pattern to showcase a component API with every supported StoryLite control.

```ts
import type { StoryLiteMeta, StoryLiteStoryDefinition } from '@storylite/storylite'

type MeterArgs = {
  label: string
  value: number
  active: boolean
  accent: string
  size: 'sm' | 'md' | 'lg'
}

export default {
  title: 'Components/Meter',
  args: {
    label: 'Completion',
    value: 64,
    active: true,
    accent: '#2563eb',
    size: 'md',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    active: { control: 'boolean' },
    accent: { control: 'color' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    renderer: 'html',
  },
} satisfies StoryLiteMeta<MeterArgs>

export const Default = {
  render: (args) => `
    <label class="meter meter--${args.size}" style="--meter-accent: ${args.accent}">
      <span>${args.label}</span>
      <progress value="${args.value}" max="100"></progress>
      <span>${args.active ? 'Active' : 'Paused'}</span>
    </label>
  `,
} satisfies StoryLiteStoryDefinition<MeterArgs>
```

## 4. Render Context and DOM Output

Use `context.document` for DOM nodes or fragments instead of string templates when the story needs
DOM APIs, event wiring, or safer text assignment.

```ts
import type { StoryLiteMeta, StoryLiteStoryDefinition } from '@storylite/storylite'

type ToastArgs = {
  title: string
  body: string
}

export default {
  title: 'Components/Toast',
  parameters: {
    renderer: 'html',
    background: '#f8fafc',
  },
} satisfies StoryLiteMeta<ToastArgs>

export const Informational = {
  args: {
    title: 'Upload complete',
    body: 'The image is ready to publish.',
  },
  render: (args, context) => {
    const article = context.document.createElement('article')
    const heading = context.document.createElement('h2')
    const body = context.document.createElement('p')

    article.className = 'toast'
    article.dataset.storyId = context.id
    heading.textContent = args.title
    body.textContent = args.body
    article.append(heading, body)

    return article
  },
} satisfies StoryLiteStoryDefinition<ToastArgs>
```

## 5. Framework Adapter Story

Use the matching adapter renderer in `parameters.renderer`. The project must register the adapter in
`.storylite/config.ts`.

```tsx
import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import { Button } from './Button'

type ButtonArgs = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}

const parameters: StoryLiteParameters = {
  renderer: 'react',
}

export default {
  title: 'React/Button',
  parameters,
} satisfies StoryLiteMeta<ButtonArgs>

export const Primary = {
  args: {
    label: 'Save changes',
    variant: 'primary',
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['primary', 'secondary'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => <Button label={args.label} variant={args.variant} disabled={args.disabled} />,
} satisfies StoryLiteStoryDefinition<ButtonArgs>
```

For Svelte, Vue, or Solid, keep the same StoryLite story shape and return the output expected by the
renderer adapter registered in the target project.

## 6. Web Component Story

Use `component` as the custom element tag. With the built-in `web-components` renderer, args are
applied as element properties/attributes and `render` is optional.

```ts
import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import css from './copy-command.css?inline'
import { defineCopyCommandElement } from './copy-command'

type CopyCommandArgs = {
  label: string
  command: string
  copied: boolean
}

const parameters: StoryLiteParameters = {
  renderer: 'web-components',
  css,
  defineCustomElements: defineCopyCommandElement,
}

export default {
  title: 'Web Components/CopyCommand',
  component: 'copy-command',
  parameters,
} satisfies StoryLiteMeta<CopyCommandArgs>

export const Install = {
  args: {
    label: 'Install StoryLite',
    command: 'pnpm add -D @storylite/storylite',
    copied: false,
  },
  argTypes: {
    label: { control: 'text' },
    command: { control: 'text' },
    copied: { control: 'boolean' },
  },
} satisfies StoryLiteStoryDefinition<CopyCommandArgs>
```

## 7. Full HTML Example With Story-Specific Overrides

This example uses every default export and named story field in StoryLite's CSF-like format.

```ts
import type { StoryLiteMeta, StoryLiteStoryDefinition } from '@storylite/storylite'
import sharedCss from './profile-card.css?inline'

type ProfileCardArgs = {
  name: string
  role: string
  tone: 'neutral' | 'success' | 'warning'
  compact: boolean
}

const CardTag = 'article'

export default {
  title: 'Components/ProfileCard',
  component: CardTag,
  args: {
    role: 'Designer',
    tone: 'neutral',
    compact: false,
  },
  argTypes: {
    name: { control: 'text' },
    role: { control: 'text' },
    tone: {
      control: { type: 'select' },
      options: ['neutral', 'success', 'warning'],
    },
    compact: { control: 'boolean' },
  },
  parameters: {
    renderer: 'html',
    css: sharedCss,
    background: '#f8fafc',
  },
} satisfies StoryLiteMeta<ProfileCardArgs>

export const Default = {
  name: 'Default profile',
  component: CardTag,
  args: {
    name: 'Mina Stone',
  },
  argTypes: {
    role: {
      control: 'text',
      description: 'Short role shown under the name',
    },
  },
  parameters: {
    css: [
      sharedCss,
      `
        .profile-card[data-tone='success'] {
          border-color: #16a34a;
        }
      `,
    ],
  },
  render: (args, context) => {
    const card = context.document.createElement('article')
    const name = context.document.createElement('h2')
    const role = context.document.createElement('p')

    card.className = 'profile-card'
    card.dataset.tone = args.tone
    card.dataset.compact = String(args.compact)
    name.textContent = args.name
    role.textContent = args.role
    card.append(name, role)

    return card
  },
} satisfies StoryLiteStoryDefinition<ProfileCardArgs>
```

## 8. Function Export Shorthand

StoryLite also accepts a named function export as a render-only story. Prefer object exports when
args, controls, or parameters matter.

```ts
export function PlainLink(): string {
  return '<a href="/docs">Read the docs</a>'
}
```
