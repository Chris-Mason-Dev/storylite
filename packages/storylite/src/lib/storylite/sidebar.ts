import type { StoryComponentGroup } from './types'

export function isSingleStoryComponent(component: StoryComponentGroup): boolean {
  return component.stories.length === 1
}

export function singleStoryComponentLabel(component: StoryComponentGroup): string {
  const story = component.stories[0]
  if (!story || story.name === 'Default') {
    return component.title
  }

  return story.name
}
