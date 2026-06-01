import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import css from '../styles.css?raw'

const parameters = {
  css,
} satisfies StoryLiteParameters

type ReleaseCardArgs = {
  eyebrow: string
  title: string
  body: string
  action: string
}

export default {
  title: 'Examples/Single Default Story',
  args: {
    eyebrow: 'Release review',
    title: 'Ship one focused state',
    body: 'Review final screenshots, controls, and static output before promoting the release.',
    action: 'Open preview',
  },
  argTypes: {
    eyebrow: { control: 'text' },
    title: { control: 'text' },
    body: { control: 'textarea' },
    action: { control: 'text' },
  },
  parameters,
} satisfies StoryLiteMeta<ReleaseCardArgs>

export const Default = {
  render: (args) => `
    <article class="demo-card">
      <div class="demo-card__icon" aria-hidden="true">1</div>
      <div class="demo-card__content">
        <p class="eyebrow">${args.eyebrow}</p>
        <h2>${args.title}</h2>
        <p>${args.body}</p>
      </div>
      <a class="demo-btn" href="#preview">${args.action}</a>
    </article>
  `,
} satisfies StoryLiteStoryDefinition<ReleaseCardArgs>
