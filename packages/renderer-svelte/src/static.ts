import type {
  StoryContext,
  StoryLiteStaticRenderResult,
  StoryLiteStory,
} from '@storylite/contracts'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

type SvelteRenderOutput = Component<Record<string, unknown>> | SvelteComponentOutput

type SvelteComponentOutput = {
  readonly component: Component<Record<string, unknown>>
  readonly props?: Record<string, unknown>
}

export function renderStory(story: StoryLiteStory): StoryLiteStaticRenderResult {
  const output = resolveOutput(story)
  const rendered = render(output.component, { props: output.props })

  return { html: rendered.body }
}

function resolveOutput(story: StoryLiteStory): {
  readonly component: Component<Record<string, unknown>>
  readonly props: Record<string, unknown>
} {
  const output = story.render?.(story.args, {
    id: story.id,
    title: story.title,
    name: story.name,
    canvas: null,
    document: null,
    window: null,
  } as unknown as StoryContext) as SvelteRenderOutput | undefined

  if (isComponentOutput(output)) {
    return { component: output.component, props: output.props ?? story.args }
  }

  const component = output ?? story.component

  if (typeof component !== 'function') {
    throw new Error(`Svelte story "${story.name}" must provide a Svelte component.`)
  }

  return {
    component: component as Component<Record<string, unknown>>,
    props: story.args,
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
