import type { StoryLiteToolbarTool } from '../../public'

export type AppTheme = 'system' | 'light' | 'dark'
export type PreviewTheme = 'light' | 'dark'
export type StoryLiteToolbarValue = boolean | string

export type StoryLiteSettings = {
  appTheme: AppTheme
  viewport: string
  previewTheme: PreviewTheme
  background: string
  zoom: number
  controlsVisible: boolean
  maximized: boolean
  customTools: Record<string, StoryLiteToolbarValue>
}

export type StoryLiteSettingsOptions = {
  readonly defaultViewport: string
  readonly viewports: readonly string[]
  readonly defaultBackground: string
  readonly backgrounds: readonly string[]
  readonly toolbarTools?: readonly StoryLiteToolbarTool[]
}

const appThemeStorageKey = 'storylite:app-theme'
const toolbarStorageKey = 'storylite:toolbar-settings'
export const storyliteZoomLevels = [50, 62.5, 75, 100, 112.5, 125, 150, 175, 200] as const
let persistentCustomToolIds = new Set<string>()

export const storyliteSettings = $state<StoryLiteSettings>({
  appTheme: 'system',
  viewport: '100%',
  previewTheme: 'light',
  background: 'light-dark(#f7f7f7, #111111)',
  zoom: 100,
  controlsVisible: true,
  maximized: false,
  customTools: {},
})

export function hydrateStoryLiteSettings(options: StoryLiteSettingsOptions): void {
  const storedToolbar = readStoredToolbarSettings()

  storyliteSettings.appTheme = readStoredAppTheme()
  storyliteSettings.viewport = includes(options.viewports, storedToolbar.viewport)
    ? storedToolbar.viewport
    : options.defaultViewport
  storyliteSettings.previewTheme = isPreviewTheme(storedToolbar.previewTheme)
    ? storedToolbar.previewTheme
    : 'light'
  storyliteSettings.background = includes(options.backgrounds, storedToolbar.background)
    ? storedToolbar.background
    : options.defaultBackground
  storyliteSettings.zoom = clampZoom(storedToolbar.zoom)
  storyliteSettings.controlsVisible =
    typeof storedToolbar.controlsVisible === 'boolean' ? storedToolbar.controlsVisible : true
  storyliteSettings.maximized =
    typeof storedToolbar.maximized === 'boolean' ? storedToolbar.maximized : false
  storyliteSettings.customTools = resolveCustomToolbarSettings(
    options.toolbarTools ?? [],
    storedToolbar.customTools,
  )
}

export function applyAppTheme(theme: AppTheme): void {
  const root = document.documentElement

  if (theme === 'system') {
    delete root.dataset.storyliteAppTheme
    root.style.removeProperty('color-scheme')
  } else {
    root.dataset.storyliteAppTheme = theme
    root.style.colorScheme = theme
  }
}

export function persistAppTheme(): void {
  writeStorage(appThemeStorageKey, storyliteSettings.appTheme)
}

export function persistToolbarSettings(): void {
  writeStorage(
    toolbarStorageKey,
    JSON.stringify({
      viewport: storyliteSettings.viewport,
      previewTheme: storyliteSettings.previewTheme,
      background: storyliteSettings.background,
      zoom: storyliteSettings.zoom,
      controlsVisible: storyliteSettings.controlsVisible,
      maximized: storyliteSettings.maximized,
      customTools: Object.fromEntries(
        Object.entries(storyliteSettings.customTools).filter(([id]) =>
          persistentCustomToolIds.has(id),
        ),
      ),
    }),
  )
}

function readStoredAppTheme(): AppTheme {
  const storedTheme = readStorage(appThemeStorageKey)
  return isAppTheme(storedTheme) ? storedTheme : 'system'
}

function readStoredToolbarSettings(): Partial<Omit<StoryLiteSettings, 'appTheme'>> {
  const storedSettings = readStorage(toolbarStorageKey)

  if (!storedSettings) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(storedSettings)

    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return parsed as Partial<Omit<StoryLiteSettings, 'appTheme'>>
  } catch {
    return {}
  }
}

function isAppTheme(value: string | null): value is AppTheme {
  return value === 'system' || value === 'light' || value === 'dark'
}

function isPreviewTheme(value: unknown): value is PreviewTheme {
  return value === 'light' || value === 'dark'
}

function includes(values: readonly string[], value: unknown): value is string {
  return typeof value === 'string' && values.includes(value)
}

export function resolveCustomToolbarSettings(
  tools: readonly StoryLiteToolbarTool[],
  storedValues: unknown,
): Record<string, StoryLiteToolbarValue> {
  const stored =
    storedValues && typeof storedValues === 'object'
      ? (storedValues as Record<string, unknown>)
      : {}
  const values: Record<string, StoryLiteToolbarValue> = {}
  persistentCustomToolIds = new Set()

  for (const tool of tools) {
    if (tool.type === 'link') {
      continue
    }

    if (tool.persist !== false) {
      persistentCustomToolIds.add(tool.id)
    }

    if (tool.type === 'toggle') {
      const storedValue = stored[tool.id]
      values[tool.id] =
        tool.persist !== false && typeof storedValue === 'boolean'
          ? storedValue
          : tool.defaultValue === true
      continue
    }

    const optionValues = tool.options.map((option) => option.value)
    const storedValue = stored[tool.id]
    values[tool.id] =
      tool.persist !== false && includes(optionValues, storedValue)
        ? storedValue
        : (tool.defaultValue ?? optionValues[0] ?? '')
  }

  return values
}

function clampZoom(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 100
  }

  return storyliteZoomLevels.reduce((nearest, zoom) =>
    Math.abs(zoom - value) < Math.abs(nearest - value) ? zoom : nearest,
  )
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore storage failures; the current in-memory settings still apply.
  }
}
