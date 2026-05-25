import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import { SolidButton } from './SolidButton'
import { SolidCard } from './SolidCard'
import { SolidList } from './SolidList'

const parameters: StoryLiteParameters = {
  renderer: 'solid',
}

export default {
  title: 'Solid/Components',
  parameters,
} satisfies StoryLiteMeta

export const Button = {
  component: SolidButton,
  args: {
    label: 'Save changes',
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies StoryLiteStoryDefinition

export const Card = {
  component: SolidCard,
  args: {
    eyebrow: 'Adapter',
    title: 'Solid renderer',
    body: 'Solid JSX is transformed only for projects that register the Solid adapter.',
  },
} satisfies StoryLiteStoryDefinition

export const List = {
  component: SolidList,
  args: {
    label: 'Pipeline',
    first: 'Resolve adapter',
    second: 'Render story',
  },
} satisfies StoryLiteStoryDefinition
