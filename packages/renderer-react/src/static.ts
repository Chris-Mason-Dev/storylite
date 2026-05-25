import type {
  StoryContext,
  StoryLiteStaticRenderResult,
  StoryLiteStory,
} from '@storylite/contracts'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export function renderStory(story: StoryLiteStory): StoryLiteStaticRenderResult {
  if (!story.render) {
    return { html: '' }
  }

  const output = story.render(story.args, {
    id: story.id,
    title: story.title,
    name: story.name,
    canvas: null,
    document: null,
    window: null,
  } as unknown as StoryContext)

  return { html: renderToStaticMarkup(output as ReactNode) }
}
