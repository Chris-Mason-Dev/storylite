import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import { PreactButton } from './PreactButton'
import { PreactCard } from './PreactCard'
import { PreactField } from './PreactField'
import { PreactStats } from './PreactStats'

type ButtonArgs = {
  label: string
  tone: 'mint' | 'ink'
  disabled: boolean
}

type CardArgs = {
  eyebrow: string
  title: string
  body: string
}

type FieldArgs = {
  label: string
  placeholder: string
}

type StatsArgs = {
  first: string
  second: string
  third: string
}

const parameters: StoryLiteParameters = {
  renderer: 'preact',
}

export default {
  title: 'Preact/Components',
  parameters,
} satisfies StoryLiteMeta

export const Button = {
  args: {
    label: 'Save changes',
    tone: 'mint',
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: ['mint', 'ink'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => <PreactButton label={args.label} tone={args.tone} disabled={args.disabled} />,
} satisfies StoryLiteStoryDefinition<ButtonArgs>

export const Card = {
  args: {
    eyebrow: 'Adapter',
    title: 'Preact renderer',
    body: 'Preact stories use the same StoryLite story model as the other framework adapters.',
  },
  render: (args) => <PreactCard eyebrow={args.eyebrow} title={args.title} body={args.body} />,
} satisfies StoryLiteStoryDefinition<CardArgs>

export const Field = {
  args: {
    label: 'Project name',
    placeholder: 'storylite-preact',
  },
  render: (args) => <PreactField label={args.label} placeholder={args.placeholder} />,
} satisfies StoryLiteStoryDefinition<FieldArgs>

export const Stats = {
  args: {
    first: 'Configure',
    second: 'Preview',
    third: 'Build',
  },
  render: (args) => <PreactStats first={args.first} second={args.second} third={args.third} />,
} satisfies StoryLiteStoryDefinition<StatsArgs>
