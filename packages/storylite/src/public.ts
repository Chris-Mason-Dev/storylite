import type { StoryIdResolver, StoryLiteRendererAdapter } from '@storylite/contracts'
import { defineRenderer } from '@storylite/contracts'

export type {
  StoryLiteRenderer,
  StoryArgs as StoryLiteArgs,
  StoryControl as StoryLiteControl,
  StoryArgType as StoryLiteArgType,
  StoryArgTypes as StoryLiteArgTypes,
  StoryContext as StoryLiteStoryContext,
  StoryRenderResult as StoryLiteRenderResult,
  StoryRender as StoryLiteRender,
  StorySourceContext as StoryLiteSourceContext,
  StorySourceSnippet as StoryLiteSourceSnippet,
  StoryParameters as StoryLiteParameters,
  StoryMeta as StoryLiteMeta,
  StoryExport as StoryLiteStoryDefinition,
  StoryIdResolver as StoryLiteStoryIdResolver,
  StoryLiteClientRenderer,
  StoryLiteClientRendererModule,
  StoryLiteStaticRenderer,
  StoryLiteStaticRendererModule,
  MountedStory as StoryLiteMountedStory,
  StoryLiteRendererAdapter,
  StoryLiteRendererPluginContext,
} from '@storylite/contracts'

export type StoryLiteBackgroundPreset = {
  readonly label: string
  readonly value: string
}

export type StoryLiteViewportPreset = {
  readonly label: string
  readonly width: string | number
  readonly icon: 'fluid' | 'mobile' | 'tablet' | 'desktop'
}

export type StoryLiteHtmlAttrs = Record<string, string | number | boolean | null | undefined>

export type StoryLiteAttrsConfig =
  | StoryLiteHtmlAttrs
  | ((defaultAttrs: StoryLiteHtmlAttrs) => StoryLiteHtmlAttrs)

export type StoryLiteHtmlFragment = string | ((defaultHtml: string) => string)

export type StoryLiteBrandConfig = {
  readonly markHtml?: string
  readonly titleHtml?: string
  readonly subtitle?: string
}

export type StoryLiteIconName =
  | 'accessibility'
  | 'bug'
  | 'external-link'
  | 'eye'
  | 'flag'
  | 'globe'
  | 'info'
  | 'layout'
  | 'monitor'
  | 'moon'
  | 'paint-bucket'
  | 'settings'
  | 'sun'
  | 'zap'

export type StoryLiteToolbarTarget =
  | {
      readonly type: 'preview-attribute' | 'manager-attribute'
      readonly name: string
    }
  | {
      readonly type: 'preview-class'
      readonly name?: string
      readonly prefix?: string
    }
  | {
      readonly type: 'url-query' | 'url-hash'
      readonly name: string
    }

export type StoryLiteToolbarOption = {
  readonly label: string
  readonly value: string
}

export type StoryLiteToolbarToggle = {
  readonly type: 'toggle'
  readonly id: string
  readonly label: string
  readonly icon?: StoryLiteIconName
  readonly defaultValue?: boolean
  readonly persist?: boolean
  readonly target?: StoryLiteToolbarTarget
}

export type StoryLiteToolbarLink = {
  readonly type: 'link'
  readonly id: string
  readonly label: string
  readonly icon?: StoryLiteIconName
  readonly href: string
  readonly target?: '_blank' | '_self'
  readonly rel?: string
}

export type StoryLiteToolbarSelect = {
  readonly type: 'select'
  readonly id: string
  readonly label: string
  readonly icon?: StoryLiteIconName
  readonly defaultValue?: string
  readonly options: readonly StoryLiteToolbarOption[]
  readonly persist?: boolean
  readonly target?: StoryLiteToolbarTarget
}

export type StoryLiteToolbarTool =
  | StoryLiteToolbarToggle
  | StoryLiteToolbarLink
  | StoryLiteToolbarSelect

export type StoryLiteToolbarConfig =
  | readonly StoryLiteToolbarTool[]
  | ((defaultTools: readonly StoryLiteToolbarTool[]) => readonly StoryLiteToolbarTool[])

export type StoryLiteMenuLink = {
  readonly id: string
  readonly label: string
  readonly href: string
  readonly icon?: StoryLiteIconName
  readonly target?: '_blank' | '_self'
  readonly rel?: string
}

export type StoryLiteMenuLinksConfig =
  | readonly StoryLiteMenuLink[]
  | ((defaultLinks: readonly StoryLiteMenuLink[]) => readonly StoryLiteMenuLink[])

export type StoryLiteVitePluginContext = {
  readonly target: 'manager' | 'prerender' | 'static'
  readonly command: 'serve' | 'build'
  readonly projectRoot: string
}

export type StoryLiteVitePluginsConfig =
  | readonly unknown[]
  | ((context: StoryLiteVitePluginContext) => readonly unknown[] | Promise<readonly unknown[]>)

export type StoryLiteUiConfig = {
  readonly brand?: StoryLiteBrandConfig
  readonly backgrounds?:
    | readonly StoryLiteBackgroundPreset[]
    | ((
        defaultBackgrounds: readonly StoryLiteBackgroundPreset[],
      ) => readonly StoryLiteBackgroundPreset[])
  readonly viewports?:
    | readonly StoryLiteViewportPreset[]
    | ((defaultViewports: readonly StoryLiteViewportPreset[]) => readonly StoryLiteViewportPreset[])
  readonly toolbar?: StoryLiteToolbarConfig
  readonly menuLinks?: StoryLiteMenuLinksConfig
  readonly css?: StoryLiteHtmlFragment
}

export type StoryLiteConfig = {
  readonly stories: readonly string[]
  readonly css?: readonly string[]
  readonly home?: string
  readonly publicDir?: string | false
  readonly vitePlugins?: StoryLiteVitePluginsConfig
  readonly setup?: string
  readonly renderers?: readonly StoryLiteRendererAdapter[]
  readonly storyId?: StoryIdResolver
  readonly ui?: StoryLiteUiConfig
  readonly managerHtmlAttrs?: StoryLiteAttrsConfig
  readonly managerBodyAttrs?: StoryLiteAttrsConfig
  readonly managerHead?: StoryLiteHtmlFragment
  readonly managerBodyStart?: StoryLiteHtmlFragment
  readonly managerBodyEnd?: StoryLiteHtmlFragment
  readonly previewHtmlAttrs?: StoryLiteAttrsConfig
  readonly previewBodyAttrs?: StoryLiteAttrsConfig
  readonly previewHead?: StoryLiteHtmlFragment
  readonly previewBodyStart?: StoryLiteHtmlFragment
  readonly previewBodyEnd?: StoryLiteHtmlFragment
}

export function defineConfig(config: StoryLiteConfig): StoryLiteConfig {
  return config
}

export { defineRenderer }
