import type { StoryLiteToolbarTarget, StoryLiteToolbarTool } from '../../public'
import type { StoryLiteToolbarValue } from './settings.svelte'

export function applyManagerToolbarTargets(
  tools: readonly StoryLiteToolbarTool[],
  values: Record<string, StoryLiteToolbarValue>,
): () => void {
  const cleanups = tools
    .map((tool) => applyToolbarTarget(document.documentElement, tool, values[tool.id], 'manager'))
    .filter((cleanup): cleanup is () => void => Boolean(cleanup))

  return () => {
    for (const cleanup of cleanups) {
      cleanup()
    }
  }
}

export function applyPreviewToolbarTargets(
  root: HTMLElement,
  tools: readonly StoryLiteToolbarTool[],
  values: Record<string, StoryLiteToolbarValue>,
): void {
  for (const tool of tools) {
    applyToolbarTarget(root, tool, values[tool.id], 'preview')
  }
}

function applyToolbarTarget(
  root: HTMLElement,
  tool: StoryLiteToolbarTool,
  value: StoryLiteToolbarValue | undefined,
  scope: 'manager' | 'preview',
): (() => void) | undefined {
  if (tool.type === 'link' || !tool.target) {
    return undefined
  }

  const target = tool.target
  if (scope === 'manager' && target.type === 'manager-attribute') {
    return applyAttributeTarget(root, target, value)
  }

  if (scope === 'manager' && (target.type === 'url-query' || target.type === 'url-hash')) {
    applyUrlTarget(target, value)
    return undefined
  }

  if (scope === 'preview' && target.type === 'preview-attribute') {
    applyAttributeTarget(root, target, value)
  }

  if (scope === 'preview' && target.type === 'preview-class') {
    applyClassTarget(root, tool, value)
  }

  return undefined
}

function applyAttributeTarget(
  root: HTMLElement,
  target: Extract<StoryLiteToolbarTarget, { type: 'manager-attribute' | 'preview-attribute' }>,
  value: StoryLiteToolbarValue | undefined,
): () => void {
  if (value === false || value === undefined || value === '') {
    root.removeAttribute(target.name)
  } else {
    root.setAttribute(target.name, value === true ? 'true' : value)
  }

  return () => root.removeAttribute(target.name)
}

function applyClassTarget(
  root: HTMLElement,
  tool: Exclude<StoryLiteToolbarTool, { type: 'link' }>,
  value: StoryLiteToolbarValue | undefined,
): void {
  const target = tool.target
  if (!target || target.type !== 'preview-class') {
    return
  }

  if (tool.type === 'toggle') {
    if (!target.name) return
    root.classList.toggle(target.name, value === true)
    return
  }

  for (const option of tool.options) {
    root.classList.remove(selectClassName(target, option.value))
  }

  if (typeof value === 'string') {
    root.classList.add(selectClassName(target, value))
  }
}

function selectClassName(
  target: Extract<StoryLiteToolbarTarget, { type: 'preview-class' }>,
  value: string,
): string {
  return target.prefix ? `${target.prefix}${value}` : `${target.name}-${value}`
}

function applyUrlTarget(
  target: Extract<StoryLiteToolbarTarget, { type: 'url-query' | 'url-hash' }>,
  value: StoryLiteToolbarValue | undefined,
): void {
  if (target.type === 'url-query') {
    const url = new URL(location.href)
    setParam(url.searchParams, target.name, value)
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`)
  } else {
    history.replaceState(history.state, '', writeHashParam(location, target.name, value))
  }
}

function setParam(params: URLSearchParams, name: string, value: StoryLiteToolbarValue | undefined) {
  if (value === false || value === undefined || value === '') {
    params.delete(name)
  } else {
    params.set(name, value === true ? 'true' : value)
  }
}

function writeHashParam(
  location: Location,
  name: string,
  value: StoryLiteToolbarValue | undefined,
): string {
  const hash = location.hash || '#/'
  const [path, query = ''] = hash.slice(1).split('?')
  const params = new URLSearchParams(query)
  setParam(params, name, value)
  const nextQuery = params.toString()

  return `${location.pathname}${location.search}#${path}${nextQuery ? `?${nextQuery}` : ''}`
}
