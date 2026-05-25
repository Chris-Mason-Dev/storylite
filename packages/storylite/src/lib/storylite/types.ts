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
} from '@storylite/contracts'

export type StoryModule = {
  readonly default?: StoryMeta
  readonly [exportName: string]: unknown
}

export type StoryGroup = {
  readonly title: string
  readonly stories: readonly StoryLiteStory[]
}

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
