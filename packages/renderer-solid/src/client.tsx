import type { MountedStory, StoryArgs, StoryContext, StoryLiteStory } from '@storylite/contracts'
import type { Component, JSX } from 'solid-js'
import { createComponent, render } from 'solid-js/web'

export function renderStory(
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
): MountedStory {
  const mountPoint = context.document.createElement('div')
  mountPoint.className = 'sl-solid-root'
  context.canvas.replaceChildren(mountPoint)

  const dispose = render(() => resolveOutput(story, args, context), mountPoint)

  return {
    cleanup: () => {
      dispose()
      context.canvas.replaceChildren()
    },
  }
}

function resolveOutput(story: StoryLiteStory, args: StoryArgs, context: StoryContext): JSX.Element {
  if (story.render) {
    return story.render(args, context) as JSX.Element
  }

  if (typeof story.component !== 'function') {
    throw new Error(`Solid story "${story.name}" must provide a component or render function.`)
  }

  return createComponent(story.component as Component<Record<string, unknown>>, args)
}
