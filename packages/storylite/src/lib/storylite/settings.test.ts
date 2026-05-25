import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StoryLiteToolbarTool } from '../../public'
import { applyAppTheme, resolveCustomToolbarSettings } from './settings.svelte'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('storylite toolbar settings', () => {
  it('hydrates custom tool state from valid stored values only', () => {
    const tools: readonly StoryLiteToolbarTool[] = [
      {
        type: 'toggle',
        id: 'a11y',
        label: 'A11y overlay',
        defaultValue: true,
        persist: true,
      },
      {
        type: 'toggle',
        id: 'session-only',
        label: 'Session only',
        defaultValue: false,
        persist: false,
      },
      {
        type: 'select',
        id: 'density',
        label: 'Density',
        defaultValue: 'comfortable',
        options: [
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Compact', value: 'compact' },
        ],
        persist: true,
      },
      {
        type: 'select',
        id: 'locale',
        label: 'Locale',
        defaultValue: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
        ],
        persist: false,
      },
      {
        type: 'link',
        id: 'docs',
        label: 'Docs',
        href: '/docs',
      },
    ]

    expect(
      resolveCustomToolbarSettings(tools, {
        a11y: false,
        'session-only': true,
        density: 'compact',
        locale: 'es',
        stale: true,
      }),
    ).toEqual({
      a11y: false,
      'session-only': false,
      density: 'compact',
      locale: 'en',
    })
  })

  it('falls back when stored select values are no longer configured options', () => {
    expect(
      resolveCustomToolbarSettings(
        [
          {
            type: 'select',
            id: 'density',
            label: 'Density',
            defaultValue: 'comfortable',
            options: [
              { label: 'Comfortable', value: 'comfortable' },
              { label: 'Compact', value: 'compact' },
            ],
          },
        ],
        { density: 'spacious' },
      ),
    ).toEqual({ density: 'comfortable' })
  })
})

describe('storylite app theme settings', () => {
  it('marks forced themes on the root element for built CSS output', () => {
    const root = createRootElement()
    vi.stubGlobal('document', { documentElement: root })

    applyAppTheme('light')

    expect(root.dataset.storyliteAppTheme).toBe('light')
    expect(root.style.colorScheme).toBe('light')

    applyAppTheme('dark')

    expect(root.dataset.storyliteAppTheme).toBe('dark')
    expect(root.style.colorScheme).toBe('dark')
  })

  it('clears forced theme markers when using the system theme', () => {
    const root = createRootElement()
    root.dataset.storyliteAppTheme = 'dark'
    root.style.colorScheme = 'dark'
    vi.stubGlobal('document', { documentElement: root })

    applyAppTheme('system')

    expect(root.dataset.storyliteAppTheme).toBeUndefined()
    expect(root.style.colorScheme).toBe('')
  })
})

function createRootElement() {
  const style = {
    colorScheme: '',
    removeProperty(this: { colorScheme: string }, name: string) {
      if (name === 'color-scheme') {
        this.colorScheme = ''
      }
    },
  }

  return {
    dataset: {} as Record<string, string | undefined>,
    style,
  }
}
