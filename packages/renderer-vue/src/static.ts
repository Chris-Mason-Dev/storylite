import type {
  StoryContext,
  StoryLiteStaticRenderResult,
  StoryLiteStory,
} from '@storylite/contracts'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h, type Component, type VNode } from 'vue'

export async function renderStory(story: StoryLiteStory): Promise<StoryLiteStaticRenderResult> {
  const app = createSSRApp({
    render: () => resolveOutput(story),
  })

  return { html: await renderToString(app) }
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

  if (!story.component) {
    throw new Error(`Vue story "${story.name}" must provide a component or render function.`)
  }

  return h(story.component as Component, story.args)
}
