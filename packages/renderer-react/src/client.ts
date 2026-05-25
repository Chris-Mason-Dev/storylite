import type { MountedStory, StoryArgs, StoryContext, StoryLiteStory } from '@storylite/contracts'
import type { ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'

export function renderStory(
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
): MountedStory {
  if (!story.render) {
    throw new Error(`React story "${story.name}" must provide a render function.`)
  }

  const mountPoint = context.document.createElement('div')
  mountPoint.className = 'sl-react-root'
  context.canvas.replaceChildren(mountPoint)

  let root: Root | null = createRoot(mountPoint, {
    onUncaughtError(error) {
      throw error
    },
  })

  root.render(story.render(args, context) as ReactNode)

  return {
    cleanup: () => {
      root?.unmount()
      root = null
      context.canvas.replaceChildren()
    },
  }
}
