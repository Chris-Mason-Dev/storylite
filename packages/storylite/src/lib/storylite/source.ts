import type {
  StoryArgs,
  StoryContext,
  StoryLiteRenderer,
  StoryLiteStory,
  StorySourceContext,
} from './types'
import {
  escapeAttribute,
  escapeHtml,
  isNodeLike,
  isPrimitive,
  isRecord,
  kebabCase,
} from './utils.js'

type ComponentSource = {
  readonly name: string
  readonly props: StoryArgs
}

const componentRenderers = new Set<StoryLiteRenderer>(['preact', 'react', 'solid', 'svelte', 'vue'])

export function resolveStorySource(story: StoryLiteStory, args: StoryArgs): string | null {
  const explicitSource = resolveExplicitSource(story, args)
  if (explicitSource) {
    return explicitSource
  }

  if (story.renderer === 'web-components' && typeof story.component === 'string') {
    return renderWebComponentSource(story.component, args)
  }

  if (story.renderer === 'html') {
    const renderedHtml = resolveHtmlRenderSource(story, args)
    if (renderedHtml) {
      return renderedHtml
    }
  }

  const componentName = story.sourceComponentName
  if (componentName && componentRenderers.has(story.renderer)) {
    if (story.render && story.component === undefined) {
      return (
        resolveRenderOutputSource(story, args, componentName) ??
        renderComponentSource(story.renderer, componentName, args)
      )
    }

    return renderComponentSource(story.renderer, componentName, args)
  }

  return null
}

function resolveExplicitSource(story: StoryLiteStory, args: StoryArgs): string | null {
  const source = story.source

  if (typeof source === 'string') {
    return source.length > 0 ? source : null
  }

  if (typeof source === 'function') {
    try {
      const value = source(args, sourceContext(story))
      return typeof value === 'string' && value.length > 0 ? value : null
    } catch {
      return null
    }
  }

  return null
}

function resolveHtmlRenderSource(story: StoryLiteStory, args: StoryArgs): string | null {
  const output = renderStoryForSource(story, args)

  if (typeof output === 'string') {
    return output.length > 0 ? output : null
  }

  if (isNodeLike(output)) {
    const html = serializeNode(output)
    return html.length > 0 ? html : null
  }

  return null
}

function resolveRenderOutputSource(
  story: StoryLiteStory,
  args: StoryArgs,
  componentName: string,
): string | null {
  if (!story.render || !componentRenderers.has(story.renderer)) {
    return null
  }

  const output = renderStoryForSource(story, args)
  const component = resolveRenderOutputComponent(output, componentName)
  return component ? renderComponentSource(story.renderer, component.name, component.props) : null
}

function renderStoryForSource(story: StoryLiteStory, args: StoryArgs): unknown {
  if (!story.render) {
    return null
  }

  try {
    return story.render(args, renderContext(story))
  } catch {
    return null
  }
}

function sourceContext(story: StoryLiteStory): StorySourceContext {
  return {
    id: story.id,
    importPath: story.importPath,
    exportName: story.exportName,
    title: story.title,
    name: story.name,
    renderer: story.renderer,
  }
}

function renderContext(story: StoryLiteStory): StoryContext {
  const documentRef = typeof document === 'undefined' ? null : document
  const windowRef =
    documentRef?.defaultView ??
    (typeof window === 'undefined' ? (globalThis as unknown as Window) : window)

  return {
    id: story.id,
    title: story.title,
    name: story.name,
    canvas: documentRef?.createElement('div') ?? ({} as HTMLElement),
    document: documentRef ?? ({} as Document),
    window: windowRef,
  }
}

function resolveRenderOutputComponent(
  output: unknown,
  componentName: string,
): ComponentSource | null {
  const value = Array.isArray(output) ? output.find(Boolean) : output
  if (!isRecord(value) || !('type' in value)) {
    return null
  }

  if (typeof value.type === 'string') {
    return null
  }

  const props = isRecord(value.props) ? value.props : {}
  const sourceProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => key !== 'children'),
  )

  return {
    name: componentName,
    props: sourceProps,
  }
}

function renderComponentSource(
  renderer: StoryLiteRenderer,
  componentName: string,
  props: StoryArgs,
): string | null {
  const attributes = Object.entries(props)
    .map(([name, value]) => renderComponentAttribute(renderer, name, value))
    .filter(Boolean)
    .join(' ')

  if (!attributes) {
    return `<${componentName} />`
  }

  return `<${componentName} ${attributes} />`
}

function renderComponentAttribute(
  renderer: StoryLiteRenderer,
  name: string,
  value: unknown,
): string | null {
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') {
    return null
  }

  switch (renderer) {
    case 'vue':
      return renderVueAttribute(name, value)
    case 'svelte':
      return renderSvelteAttribute(name, value)
    default:
      return renderJsxAttribute(name, value)
  }
}

function renderJsxAttribute(name: string, value: unknown): string | null {
  const literal = jsLiteral(value)
  return literal ? `${name}={${literal}}` : null
}

function renderSvelteAttribute(name: string, value: unknown): string | null {
  if (typeof value === 'string') {
    return `${name}="${escapeAttribute(value)}"`
  }

  const literal = jsLiteral(value)
  return literal ? `${name}={${literal}}` : null
}

function renderVueAttribute(name: string, value: unknown): string | null {
  const attr = kebabCase(name)

  if (typeof value === 'string') {
    return `${attr}="${escapeAttribute(value)}"`
  }

  const literal = jsLiteral(value)
  return literal ? `:${attr}="${escapeAttribute(literal)}"` : null
}

function renderWebComponentSource(tagName: string, args: StoryArgs): string {
  const attrs = Object.entries(args)
    .filter(([, value]) => isPrimitive(value))
    .map(([name, value]) => {
      const attr = kebabCase(name)
      return value === true
        ? ` ${attr}`
        : value === false
          ? ''
          : ` ${attr}="${escapeAttribute(value)}"`
    })
    .join('')
  const label = typeof args.label === 'string' ? escapeHtml(args.label) : ''

  return `<${tagName}${attrs}>${label}</${tagName}>`
}

function serializeNode(node: Node | DocumentFragment): string {
  if ('outerHTML' in node && typeof node.outerHTML === 'string') {
    return node.outerHTML
  }

  if ('childNodes' in node) {
    return Array.from(node.childNodes)
      .map((child) => serializeNode(child))
      .join('')
  }

  return (node as Node).textContent ?? ''
}

function jsLiteral(value: unknown): string | null {
  if (value === undefined) {
    return null
  }

  const literal = JSON.stringify(value)
  return literal === undefined ? null : literal
}
