import type { StoryArgType, StoryLiteStory, StoryMeta } from '@storylite/contracts'

export type {
  MountedStory,
  StoryArgType,
  StoryArgTypes,
  StoryArgs,
  StoryContext,
  StoryControl,
  StoryControlType,
  StoryExport,
  StoryIdOptions,
  StoryIdResolver,
  StoryLiteBuiltinRenderer,
  StoryLiteClientRenderer,
  StoryLiteClientRendererModule,
  StoryLiteRenderer,
  StoryLiteStaticRenderer,
  StoryLiteStaticRendererModule,
  StoryLiteStaticRenderResult,
  StoryLiteStory,
  StoryMeta,
  StoryParameters,
  StoryRender,
  StoryRenderResult,
  StorySourceContext,
  StorySourceSnippet,
} from '@storylite/contracts'

export type StoryModule = {
  readonly default?: StoryMeta
  readonly [exportName: string]: unknown
}

export type StoryModuleSourceMetadata = {
  readonly metaComponentName?: string
  readonly storyComponentNames?: Record<string, string>
}

export type StorySourceMetadataByImportPath = Record<string, StoryModuleSourceMetadata>

export type StoryComponentGroup = {
  readonly kind: 'component'
  readonly title: string
  readonly stories: readonly StoryLiteStory[]
  readonly storyCount: number
}

export type StoryGroup = {
  readonly kind: 'group'
  readonly title: string
  readonly components: readonly StoryComponentGroup[]
  readonly storyCount: number
}

export type StoryTreeItem = StoryComponentGroup | StoryGroup

export type StoryIdCollisionEntry = {
  readonly importPath: string
  readonly exportName: string
  readonly title: string
  readonly name: string
}

export type StoryIdCollision = {
  readonly id: string
  readonly stories: readonly StoryIdCollisionEntry[]
}

export type StoryNormalizationResult = {
  readonly stories: readonly StoryLiteStory[]
  readonly idCollisions: readonly StoryIdCollision[]
}
