import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteRender,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import css from '../styles.css?raw'
import badgeHtml from './badge.html?raw'
import buttonHtml from './button.html?raw'
import cardHtml from './card.html?raw'
import fieldHtml from './field.html?raw'
import layoutHtml from './layout.html?raw'

const parameters: StoryLiteParameters = { css }

export default {
  title: 'Examples/Pure CSS',
  parameters,
} satisfies StoryLiteMeta

type TemplateArgs = Record<string, string | number | boolean>

type ButtonArgs = {
  label: string
  variant: 'primary' | 'secondary' | 'quiet'
}

type CardArgs = {
  eyebrow: string
  icon: string
  title: string
  body: string
  action: string
}

type FieldArgs = {
  label: string
  placeholder: string
  type: 'email' | 'text' | 'search'
  hint: string
}

type BadgeArgs = {
  label: string
  tone: 'stable' | 'new' | 'experimental'
}

type LayoutArgs = {
  project: string
  eyebrow: string
  headline: string
  storyCount: string
  rendererCount: string
}

export const Button = {
  args: {
    label: 'Run storylite build',
    variant: 'primary',
  },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['primary', 'secondary', 'quiet'] },
  },
  render: template(buttonHtml),
} satisfies StoryLiteStoryDefinition<ButtonArgs>

export const Badge = {
  args: {
    label: 'Built-in HTML renderer',
    tone: 'stable',
  },
  argTypes: {
    tone: { control: 'select', options: ['stable', 'new', 'experimental'] },
  },
  render: template(badgeHtml),
} satisfies StoryLiteStoryDefinition<BadgeArgs>

export const Card = {
  args: {
    eyebrow: 'Renderer coverage',
    icon: 'HTML',
    title: 'Start with portable markup',
    body: 'Use plain HTML stories for design-system atoms, docs examples, and server-rendered fragments before adding a framework adapter.',
    action: 'View adapter docs',
  },
  render: template(cardHtml),
} satisfies StoryLiteStoryDefinition<CardArgs>

export const Field = {
  args: {
    label: 'Filter stories',
    placeholder: 'Button, dropdown, shell...',
    type: 'search',
    hint: 'Useful for story catalogs with framework and HTML examples side by side.',
  },
  argTypes: {
    type: { control: 'select', options: ['email', 'text', 'search'] },
  },
  render: template(fieldHtml),
} satisfies StoryLiteStoryDefinition<FieldArgs>

export const Layout = {
  args: {
    project: 'StoryLite web',
    eyebrow: 'Static preview',
    headline: 'A compact project surface for reviewing stories before release',
    storyCount: '10',
    rendererCount: '2',
  },
  render: template(layoutHtml),
} satisfies StoryLiteStoryDefinition<LayoutArgs>

function template<TArgs extends TemplateArgs>(html: string) {
  return ((args: TArgs) =>
    Object.entries(args).reduce(
      (output, [key, value]) => output.replaceAll(`{{ ${key} }}`, String(value)),
      html,
    )) satisfies StoryLiteRender<TArgs>
}
