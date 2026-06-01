import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'
import type { StoryLiteProjectUi } from 'virtual:storylite/project'
import StorySidebar from './StorySidebar.svelte'
import { groupStories } from '../storylite/normalize'
import type { StoryLiteStory } from '../storylite/types'

const projectUi: StoryLiteProjectUi = {
  brand: {
    markHtml: '',
    titleHtml: 'StoryLite',
    subtitle: null,
  },
  backgrounds: [],
  viewports: [],
  toolbar: [],
  menuLinks: [],
  css: '',
}

describe('StorySidebar', () => {
  it('renders one generated Default story as a direct component link', () => {
    const stories = [story({ title: 'Components/Button' })]
    const { body } = renderSidebar(stories)

    expect(body).toContain('<span>Components</span>')
    expect(body).toContain('<span>Button</span>')
    expect(body).not.toContain('story-component__toggle')
    expect(body).not.toContain('<span>Default</span>')
  })

  it('renders one non-default story as a direct story link', () => {
    const stories = [
      story({
        exportName: 'ReadyState',
        name: 'Ready State',
        title: 'Components/Status Badge',
      }),
    ]
    const { body } = renderSidebar(stories)

    expect(body).toContain('<span>Components</span>')
    expect(body).toContain('<span>Ready State</span>')
    expect(body).not.toContain('story-component__toggle')
    expect(body).not.toContain('<span>Status Badge</span>')
  })
})

function renderSidebar(stories: readonly StoryLiteStory[]): { body: string } {
  return render(StorySidebar, {
    props: {
      projectUi,
      stories,
      groups: groupStories(stories),
      activeStoryId: undefined,
      hasHome: false,
      isHomeActive: false,
      storyHref: (story) => `#/${story.id}`,
      onSelectStory: () => undefined,
      searchQuery: '',
    },
  })
}

function story(overrides: Partial<StoryLiteStory> = {}): StoryLiteStory {
  return {
    id: 'components-button--default',
    importPath: 'src/components/button.stories.ts',
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
