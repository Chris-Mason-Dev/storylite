import type { MountedStory, StoryArgs, StoryContext, StoryLiteStory } from '@storylite/contracts'
import { createApp, h, type Component, type VNode } from 'vue'

export function renderStory(
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
): MountedStory {
  const mountPoint = context.document.createElement('div')
  mountPoint.className = 'sl-vue-root'
  context.canvas.replaceChildren(mountPoint)

  const app = createApp({
    render: () => resolveOutput(story, args, context),
  })
  app.mount(mountPoint)

  return {
    cleanup: () => {
      app.unmount()
      context.canvas.replaceChildren()
    },
  }
}

function resolveOutput(story: StoryLiteStory, args: StoryArgs, context: StoryContext): VNode {
  if (story.render) {
    return story.render(args, context) as VNode
  }

  if (!story.component) {
    throw new Error(`Vue story "${story.name}" must provide a component or render function.`)
  }

  return h(story.component as Component, args)
}
