import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import VueButton from './VueButton.vue'
import VueCard from './VueCard.vue'
import VueField from './VueField.vue'

const parameters: StoryLiteParameters = {
  renderer: 'vue',
}

export default {
  title: 'Vue/Components',
  parameters,
} satisfies StoryLiteMeta

export const Button = {
  component: VueButton,
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
  component: VueCard,
  args: {
    eyebrow: 'Adapter',
    title: 'Vue renderer',
    body: 'Vue stories are enabled only when the project registers the Vue adapter.',
  },
} satisfies StoryLiteStoryDefinition

export const Field = {
  component: VueField,
  args: {
    label: 'Project name',
    placeholder: 'storylite-vue',
  },
} satisfies StoryLiteStoryDefinition
