import type {
  StoryArgType,
  StoryArgTypes,
  StoryArgs,
  StoryExport,
  StoryGroup,
  StoryIdCollision,
  StoryIdOptions,
  StoryLiteRenderer,
  StoryLiteStory,
  StoryMeta,
  StoryModuleSourceMetadata,
  StoryModule,
  StoryNormalizationResult,
  StorySourceMetadataByImportPath,
  StoryParameters,
} from './types'
import { isRecord, kebabCase } from './utils.js'

const reservedExports = new Set(['default', '__esModule'])

type StoryNormalizationOptions = StoryIdOptions & {
  readonly exportNames?: readonly string[]
  readonly exportNamesByImportPath?: Record<string, readonly string[]>
  readonly sourceMetadata?: StoryModuleSourceMetadata
  readonly sourceMetadataByImportPath?: StorySourceMetadataByImportPath
}

export function normalizeStoryModules(
  modules: Record<string, StoryModule>,
  options: StoryNormalizationOptions = {},
): readonly StoryLiteStory[] {
  return normalizeStoryModulesWithDiagnostics(modules, options).stories
}

export function normalizeStoryModulesWithDiagnostics(
  modules: Record<string, StoryModule>,
  options: StoryNormalizationOptions = {},
): StoryNormalizationResult {
  const stories = Object.entries(modules).flatMap(([importPath, module]) =>
    normalizeStoryModule(importPath, module, {
      ...options,
      exportNames: options.exportNamesByImportPath?.[importPath] ?? options.exportNames,
      sourceMetadata: options.sourceMetadataByImportPath?.[importPath] ?? options.sourceMetadata,
    }),
  )

  return {
    stories,
    idCollisions: findStoryIdCollisions(stories),
  }
}

export function normalizeStoryModule(
  importPath: string,
  module: StoryModule,
  options: StoryNormalizationOptions = {},
): readonly StoryLiteStory[] {
  const meta = isRecord(module.default) ? (module.default as StoryMeta) : {}
  const title = normalizeTitle(meta.title, importPath)
  const stories: StoryLiteStory[] = []

  for (const [exportName, value] of orderedStoryModuleEntries(module, options.exportNames)) {
    if (reservedExports.has(exportName)) {
      continue
    }

    const storyExport = normalizeStoryExport(value)
    if (!storyExport) {
      continue
    }

    const name = storyExport.name ?? labelFromExportName(exportName)
    const args = mergeArgs(meta.args, storyExport.args)
    const argTypes = mergeArgTypes(meta.argTypes, storyExport.argTypes)
    const parameters = mergeParameters(meta.parameters, storyExport.parameters)
    const component = storyExport.component ?? meta.component
    const render = storyExport.render
    const source = storyExport.source ?? meta.source
    const sourceComponentName =
      options.sourceMetadata?.storyComponentNames?.[exportName] ??
      options.sourceMetadata?.metaComponentName
    const renderer = selectRenderer(parameters, component, render)

    stories.push({
      id: storyId(importPath, exportName, options.resolveId),
      importPath,
      exportName,
      title,
      name,
      component,
      args,
      argTypes,
      parameters,
      render,
      source,
      sourceComponentName,
      renderer,
    })
  }

  return stories
}

export function groupStories(stories: readonly StoryLiteStory[]): readonly StoryGroup[] {
  const groups = new Map<string, StoryLiteStory[]>()

  for (const story of stories) {
    const group = groups.get(story.title) ?? []
    group.push(story)
    groups.set(story.title, group)
  }

  return Array.from(groups.entries()).map(([title, group]) => ({
    title,
    stories: group,
  }))
}

export function storyId(
  importPath: string,
  exportName: string,
  resolveId?: StoryIdOptions['resolveId'],
): string {
  return storyIdFromSuggestion(importPath, exportName, resolveId)
}

export function storyIdFromSuggestion(
  importPath: string,
  exportName: string,
  resolveId?: StoryIdOptions['resolveId'],
): string {
  const suggestedId = suggestedStoryId(importPath, exportName)
  const resolvedId = resolveId?.(importPath, suggestedId) ?? suggestedId
  return String(resolvedId || suggestedId).trim() || suggestedId
}

export function suggestedStoryId(importPath: string, exportName: string): string {
  const pathPart = importPath
    .replace(/^\.\.\//, '')
    .replace(/^(?:\.\/)?src\//, '')
    .replace(/\.(stories|story)\.[cm]?[tj]sx?$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `${pathPart}--${kebabCase(exportName)}`
}

export function findStoryIdCollisions(
  stories: readonly StoryLiteStory[],
): readonly StoryIdCollision[] {
  const byId = new Map<string, StoryLiteStory[]>()

  for (const story of stories) {
    const group = byId.get(story.id) ?? []
    group.push(story)
    byId.set(story.id, group)
  }

  return Array.from(byId.entries())
    .filter(([, group]) => group.length > 1)
    .map(([id, group]) => ({
      id,
      stories: group.map((story) => ({
        importPath: story.importPath,
        exportName: story.exportName,
        title: story.title,
        name: story.name,
      })),
    }))
}

export function inferControlType(argType: StoryArgType | undefined, value: unknown): string {
  const control = argType?.control

  if (typeof control === 'string') {
    return control
  }

  if (isRecord(control) && typeof control.type === 'string') {
    return control.type
  }

  if (Array.isArray(argType?.options)) {
    return 'select'
  }

  switch (typeof value) {
    case 'boolean':
      return 'boolean'
    case 'number':
      return 'number'
    default:
      return 'text'
  }
}

function normalizeStoryExport(value: unknown): StoryExport | null {
  if (typeof value === 'function') {
    return { render: value as StoryExport['render'] }
  }

  if (!isRecord(value)) {
    return null
  }

  return value as StoryExport
}

function orderedStoryModuleEntries(
  module: StoryModule,
  exportNames: readonly string[] = [],
): [string, unknown][] {
  const entries: [string, unknown][] = []
  const seen = new Set<string>()

  for (const exportName of exportNames) {
    if (seen.has(exportName) || reservedExports.has(exportName) || !(exportName in module)) {
      continue
    }

    entries.push([exportName, module[exportName]])
    seen.add(exportName)
  }

  for (const [exportName, value] of Object.entries(module)) {
    if (!seen.has(exportName)) {
      entries.push([exportName, value])
    }
  }

  return entries
}

function normalizeTitle(title: string | undefined, importPath: string): string {
  if (title?.trim()) {
    return title.trim()
  }

  return (
    importPath
      .split('/')
      .at(-1)
      ?.replace(/\.(stories|story)\.[cm]?[tj]sx?$/, '')
      .replaceAll('-', ' ') ?? 'Stories'
  )
}

function labelFromExportName(exportName: string): string {
  return exportName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mergeArgs(metaArgs: StoryArgs | undefined, storyArgs: StoryArgs | undefined): StoryArgs {
  return { ...(metaArgs ?? {}), ...(storyArgs ?? {}) }
}

function mergeArgTypes(
  metaArgTypes: StoryArgTypes | undefined,
  storyArgTypes: StoryArgTypes | undefined,
): Record<string, StoryArgType> {
  const merged: Record<string, StoryArgType> = {}

  for (const [name, argType] of Object.entries({
    ...(metaArgTypes ?? {}),
    ...(storyArgTypes ?? {}),
  })) {
    if (argType) {
      merged[name] = argType
    }
  }

  return merged
}

function mergeParameters(
  metaParameters: StoryParameters | undefined,
  storyParameters: StoryParameters | undefined,
): StoryParameters {
  return { ...(metaParameters ?? {}), ...(storyParameters ?? {}) }
}

function selectRenderer(
  parameters: StoryParameters,
  component: string | unknown,
  render: StoryExport['render'],
): StoryLiteRenderer {
  if (parameters.renderer) {
    return parameters.renderer
  }

  if (typeof component === 'string' && !render) {
    return 'web-components'
  }

  return 'html'
}
