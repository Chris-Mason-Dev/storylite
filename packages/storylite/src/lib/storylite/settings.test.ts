import { describe, expect, it } from 'vitest'
import type { StoryLiteToolbarTool } from '../../public'
import { resolveCustomToolbarSettings } from './settings.svelte'

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
