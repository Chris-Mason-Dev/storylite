import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import css from '../styles.css?raw'
import { defineCustomElements } from './elements'

type ButtonArgs = {
  label: string
  variant: 'primary' | 'secondary'
  disabled: boolean
}

type AlertArgs = {
  label: string
  tone: 'success' | 'neutral'
}

type DisclosureArgs = {
  title: string
  content: string
  open: boolean
}

type MeterArgs = {
  label: string
  value: number
  accent: string
}

const parameters: StoryLiteParameters = {
  css,
  defineCustomElements,
}

export default {
  title: 'Web Components/Light DOM',
  parameters,
} satisfies StoryLiteMeta

export const Button = {
  component: 'sl-demo-button',
  args: {
    label: 'Save recipe',
    variant: 'primary',
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['primary', 'secondary'] },
    disabled: { control: 'boolean' },
  },
} satisfies StoryLiteStoryDefinition<ButtonArgs>

export const Alert = {
  component: 'sl-demo-alert',
  args: {
    label: 'Your components keep their light-DOM content before and after upgrade.',
    tone: 'success',
  },
  argTypes: {
    tone: { control: 'select', options: ['success', 'neutral'] },
  },
} satisfies StoryLiteStoryDefinition<AlertArgs>

export const Disclosure = {
  args: {
    title: 'What gets enhanced?',
    content: 'JavaScript adds ARIA and toggling behavior. The fallback markup is still visible.',
    open: true,
  },
  argTypes: {
    open: { control: 'boolean' },
  },
  render: (args) => `
    <sl-demo-disclosure ${args.open ? 'open' : ''}>
      <button type="button">${args.title}</button>
      <div>${args.content}</div>
    </sl-demo-disclosure>
  `,
} satisfies StoryLiteStoryDefinition<DisclosureArgs>

export const Meter = {
  component: 'sl-demo-meter',
  args: {
    label: 'Coverage',
    value: 72,
    accent: '#0f766e',
  },
  argTypes: {
    value: { control: 'number' },
    accent: { control: 'color' },
  },
} satisfies StoryLiteStoryDefinition<MeterArgs>
