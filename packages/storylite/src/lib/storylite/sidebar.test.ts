import { describe, expect, it } from 'vitest'
import { isSingleStoryComponent, singleStoryComponentLabel } from './sidebar'
import type { StoryComponentGroup, StoryLiteStory } from './types'

describe('isSingleStoryComponent', () => {
  it('matches one story with any export name', () => {
    expect(isSingleStoryComponent(component([story({ exportName: 'Default' })]))).toBe(true)
    expect(
      isSingleStoryComponent(component([story({ exportName: 'Primary', name: 'Primary' })])),
    ).toBe(true)
  })

  it('does not match components with multiple stories', () => {
    expect(
      isSingleStoryComponent(
        component([
          story({ exportName: 'Default', name: 'Default' }),
          story({ exportName: 'Disabled', name: 'Disabled' }),
        ]),
      ),
    ).toBe(false)
  })
})

describe('singleStoryComponentLabel', () => {
  it('uses the component title for generated Default stories', () => {
    expect(singleStoryComponentLabel(component([story()]))).toBe('Button')
  })

  it('uses the story display name when a single export has another name', () => {
    expect(
      singleStoryComponentLabel(component([story({ exportName: 'Primary', name: 'Primary' })])),
    ).toBe('Primary')
    expect(singleStoryComponentLabel(component([story({ name: 'Default profile' })]))).toBe(
      'Default profile',
    )
  })
})

function component(stories: readonly StoryLiteStory[]): StoryComponentGroup {
  return {
    kind: 'component',
    title: 'Button',
    stories,
    storyCount: stories.length,
  }
}

function story(overrides: Partial<StoryLiteStory> = {}): StoryLiteStory {
  return {
    id: 'button--default',
    importPath: 'src/button.stories.ts',
    exportName: 'Default',
    title: 'Components/Button',
    name: 'Default',
    args: {},
    argTypes: {},
    parameters: {},
    renderer: 'html',
    ...overrides,
  }
}
