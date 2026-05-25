import type { MountedStory, StoryArgs, StoryContext, StoryLiteStory } from '@storylite/contracts'
import { mount, unmount, type Component } from 'svelte'

type SvelteRenderOutput = Component<Record<string, unknown>> | SvelteComponentOutput

type SvelteComponentOutput = {
  readonly component: Component<Record<string, unknown>>
  readonly props?: Record<string, unknown>
}

export function renderStory(
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
): MountedStory {
  const output = resolveOutput(story, args, context)
  const mountPoint = context.document.createElement('div')
  mountPoint.className = 'sl-svelte-root'
  context.canvas.replaceChildren(mountPoint)

  const component = mount(output.component, {
    target: mountPoint,
    props: output.props,
  })

  return {
    cleanup: async () => {
      await unmount(component)
      context.canvas.replaceChildren()
    },
  }
}

function resolveOutput(
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
): {
  readonly component: Component<Record<string, unknown>>
  readonly props: Record<string, unknown>
} {
  const output = story.render?.(args, context) as SvelteRenderOutput | undefined

  if (isComponentOutput(output)) {
    return { component: output.component, props: output.props ?? args }
  }

  const component = output ?? story.component

  if (typeof component !== 'function') {
    throw new Error(`Svelte story "${story.name}" must provide a Svelte component.`)
  }

  return {
    component: component as Component<Record<string, unknown>>,
    props: args,
  }
}

function isComponentOutput(value: unknown): value is SvelteComponentOutput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'component' in value &&
    typeof (value as { component?: unknown }).component === 'function'
  )
}
