import { describe, expect, it } from 'vitest'
import { defineConfig } from './public'

describe('@storylite/storylite', () => {
  it('smoke', () => {
    expect('StoryLite').toBe('StoryLite')
  })

  it('exposes a typed config helper', () => {
    expect(defineConfig({ stories: ['./src/**/*.stories.ts'], css: ['./src/styles.css'] })).toEqual(
      {
        stories: ['./src/**/*.stories.ts'],
        css: ['./src/styles.css'],
      },
    )
  })
})
