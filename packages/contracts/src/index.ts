export type StoryLiteBuiltinRenderer = 'html' | 'web-components'
export type StoryLiteRenderer = StoryLiteBuiltinRenderer | (string & {})

export type StoryArgs = Record<string, unknown>

export type StoryIdResolver = (path: string, suggestedId: string) => string

export type StoryIdOptions = {
  readonly resolveId?: StoryIdResolver
}

export type StoryControlType = 'boolean' | 'text' | 'textarea' | 'number' | 'color' | 'select'
export type StoryControl = StoryControlType | { readonly type: StoryControlType }

export type StoryArgType<TOption = unknown> = {
  readonly control?: StoryControl
  readonly options?: readonly TOption[]
  readonly description?: string
}

export type StoryArgTypes<TArgs extends StoryArgs = StoryArgs> = Partial<{
  readonly [Name in keyof TArgs & string]: StoryArgType<TArgs[Name]>
}>

export type StoryContext = {
  readonly id: string
  readonly title: string
  readonly name: string
  readonly canvas: HTMLElement
  readonly document: Document
  readonly window: Window
}

export type StoryRenderResult = string | Node | DocumentFragment | unknown

export type StoryRender<TArgs extends StoryArgs = StoryArgs> = (
  args: TArgs,
  context: StoryContext,
) => StoryRenderResult

export type StorySourceContext = {
  readonly id: string
  readonly importPath: string
  readonly exportName: string
  readonly title: string
  readonly name: string
  readonly renderer: StoryLiteRenderer
}

export type StorySourceSnippet<TArgs extends StoryArgs = StoryArgs> =
  | string
  | ((args: TArgs, context: StorySourceContext) => string | null | undefined)

export type StoryParameters = {
  readonly renderer?: StoryLiteRenderer
  readonly css?: string | readonly string[]
  readonly background?: string
  readonly defineCustomElements?: (window: Window) => void
}

export type StoryMeta<TArgs extends StoryArgs = StoryArgs> = {
  readonly title?: string
  readonly component?: string | unknown
  readonly args?: Partial<TArgs>
  readonly argTypes?: StoryArgTypes<TArgs>
  readonly parameters?: StoryParameters
  readonly source?: StorySourceSnippet<TArgs>
}

export type StoryExport<TArgs extends StoryArgs = StoryArgs> = {
  readonly name?: string
  readonly component?: string | unknown
  readonly args?: Partial<TArgs>
  readonly argTypes?: StoryArgTypes<TArgs>
  readonly parameters?: StoryParameters
  readonly render?: StoryRender<TArgs>
  readonly source?: StorySourceSnippet<TArgs>
}

export type StoryLiteStory = {
  readonly id: string
  readonly importPath: string
  readonly exportName: string
  readonly title: string
  readonly name: string
  readonly component?: string | unknown
  readonly args: StoryArgs
  readonly argTypes: Record<string, StoryArgType>
  readonly parameters: StoryParameters
  readonly render?: StoryRender
  readonly source?: StorySourceSnippet
  readonly renderer: StoryLiteRenderer
}

export type MountedStory = {
  readonly cleanup: () => void | Promise<void>
}

export type StoryLiteClientRenderer = (
  story: StoryLiteStory,
  args: StoryArgs,
  context: StoryContext,
) => MountedStory | Promise<MountedStory>

export type StoryLiteClientRendererModule = {
  readonly renderStory?: StoryLiteClientRenderer
  readonly default?: StoryLiteClientRenderer | { readonly renderStory?: StoryLiteClientRenderer }
}

export type StoryLiteStaticRenderResult = {
  readonly html: string
  readonly warning?: string
}

export type StoryLiteStaticRenderer = (
  story: StoryLiteStory,
) => StoryLiteStaticRenderResult | Promise<StoryLiteStaticRenderResult>

export type StoryLiteStaticRendererModule = {
  readonly renderStory?: StoryLiteStaticRenderer
  readonly default?: StoryLiteStaticRenderer | { readonly renderStory?: StoryLiteStaticRenderer }
}

export type StoryLiteRendererAdapter = {
  readonly name: string
  readonly client: string
  readonly static?: string
  readonly vitePlugins?: (
    context: StoryLiteRendererPluginContext,
  ) => readonly unknown[] | Promise<readonly unknown[]>
}

export type StoryLiteRendererPluginContext = {
  readonly target: 'manager' | 'prerender' | 'static'
  readonly command: 'serve' | 'build'
  readonly projectRoot: string
}

export function defineRenderer(adapter: StoryLiteRendererAdapter): StoryLiteRendererAdapter {
  return adapter
}
