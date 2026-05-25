import type { MountedStory, StoryArgs, StoryContext, StoryLiteStory } from '@storylite/contracts'
import type { ComponentChild, ComponentType } from 'preact'
import { h, render } from 'preact'

export function renderStory(
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
): MountedStory {
  const mountPoint = context.document.createElement('div')
  mountPoint.className = 'sl-preact-root'
  context.canvas.replaceChildren(mountPoint)

  render(resolveOutput(story, args, context), mountPoint)

  return {
    cleanup: () => {
      render(null, mountPoint)
      context.canvas.replaceChildren()
    },
  }
}

function resolveOutput(
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
): ComponentChild {
  if (story.render) {
    return story.render(args, context) as ComponentChild
  }

  if (typeof story.component !== 'function') {
    throw new Error(`Preact story "${story.name}" must provide a component or render function.`)
  }

  return h(story.component as ComponentType<Record<string, unknown>>, args)
}
