import type {
  StoryContext,
  StoryLiteStaticRenderResult,
  StoryLiteStory,
} from '@storylite/contracts'
import type { Component, JSX } from 'solid-js'
import { createComponent, renderToString } from 'solid-js/web'

export function renderStory(story: StoryLiteStory): StoryLiteStaticRenderResult {
  return { html: renderToString(() => resolveOutput(story)) }
}

function resolveOutput(story: StoryLiteStory): JSX.Element {
  if (story.render) {
    return story.render(story.args, {
      id: story.id,
      title: story.title,
      name: story.name,
      canvas: null,
      document: null,
      window: null,
    } as unknown as StoryContext) as JSX.Element
  }

  if (typeof story.component !== 'function') {
    throw new Error(`Solid story "${story.name}" must provide a component or render function.`)
  }

  return createComponent(story.component as Component<Record<string, unknown>>, story.args)
}
