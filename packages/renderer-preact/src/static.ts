import type {
  StoryContext,
  StoryLiteStaticRenderResult,
  StoryLiteStory,
} from '@storylite/contracts'
import type { ComponentType, VNode } from 'preact'
import { h } from 'preact'
import renderToString from 'preact-render-to-string'

export function renderStory(story: StoryLiteStory): StoryLiteStaticRenderResult {
  return { html: renderToString(resolveOutput(story)) }
}

function resolveOutput(story: StoryLiteStory): VNode {
  if (story.render) {
    return story.render(story.args, {
      id: story.id,
      title: story.title,
      name: story.name,
      canvas: null,
      document: null,
      window: null,
    } as unknown as StoryContext) as VNode
  }

  if (typeof story.component !== 'function') {
    throw new Error(`Preact story "${story.name}" must provide a component or render function.`)
  }

  return h(story.component as ComponentType<Record<string, unknown>>, story.args)
}
