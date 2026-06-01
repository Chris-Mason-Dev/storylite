import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import css from '../styles.css?raw'

const parameters = {
  css,
} satisfies StoryLiteParameters

type StatusArgs = {
  label: string
  tone: 'stable' | 'new' | 'experimental'
  title: string
  body: string
}

export default {
  title: 'Examples/Single Named Export',
  args: {
    label: 'Ready',
    tone: 'stable',
    title: 'Named export state',
    body: 'Package checks are green and the release candidate is ready for visual review.',
  },
  argTypes: {
    label: { control: 'text' },
    tone: { control: 'select', options: ['stable', 'new', 'experimental'] },
    title: { control: 'text' },
    body: { control: 'textarea' },
  },
  parameters,
} satisfies StoryLiteMeta<StatusArgs>

export const ReadyState = {
  render: (args) => `
    <article class="demo-card">
      <div class="demo-card__icon" aria-hidden="true">R</div>
      <div class="demo-card__content">
        <span class="demo-badge" data-tone="${args.tone}">
          <span class="demo-badge__dot" aria-hidden="true"></span>
          ${args.label}
        </span>
        <h2>${args.title}</h2>
        <p>${args.body}</p>
      </div>
    </article>
  `,
} satisfies StoryLiteStoryDefinition<StatusArgs>
