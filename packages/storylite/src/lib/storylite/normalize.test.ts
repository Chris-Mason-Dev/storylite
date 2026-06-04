import { describe, expect, it } from 'vitest'
import {
  groupStories,
  inferControlType,
  normalizeStoryModule,
  normalizeStoryModulesWithDiagnostics,
  sortStoryTree,
  storyId,
} from './normalize'
import type { StoryTreeItem } from './types'

describe('normalizeStoryModule', () => {
  it('merges meta and story args and picks html by default', () => {
    const stories = normalizeStoryModule('../demo/button.stories.ts', {
      default: {
        title: 'CSS/Button',
        args: { label: 'Save', variant: 'primary' },
        argTypes: { variant: { control: 'select', options: ['primary', 'ghost'] } },
      },
      Secondary: {
        args: { variant: 'secondary' },
        render: () => '<button>Save</button>',
      },
    })

    expect(stories).toHaveLength(1)
    expect(stories[0]?.args).toEqual({ label: 'Save', variant: 'secondary' })
    expect(stories[0]?.renderer).toBe('html')
    expect(stories[0]?.argTypes.variant?.options).toEqual(['primary', 'ghost'])
  })

  it('selects web-components when component is a tag and no render is supplied', () => {
    const stories = normalizeStoryModule('../demo/toggle.stories.ts', {
      default: { title: 'WC/Toggle', component: 'demo-toggle' },
      Default: { args: { checked: true } },
    })

    expect(stories[0]?.renderer).toBe('web-components')
  })

  it('uses story source before meta source', () => {
    const metaSource = () => '<MetaButton />'
    const storySource = () => '<StoryButton />'
    const stories = normalizeStoryModule('../demo/button.stories.ts', {
      default: { source: metaSource },
      MetaOnly: { args: { label: 'Meta' } },
      StoryOnly: { args: { label: 'Story' }, source: storySource },
    })

    expect(stories.find((story) => story.exportName === 'MetaOnly')?.source).toBe(metaSource)
    expect(stories.find((story) => story.exportName === 'StoryOnly')?.source).toBe(storySource)
  })

  it('preserves source export order when module namespace entries are sorted', () => {
    const stories = normalizeStoryModule(
      '../demo/button.stories.ts',
      {
        Alpha: { render: () => '<button>Alpha</button>' },
        Middle: { render: () => '<button>Middle</button>' },
        Zebra: { render: () => '<button>Zebra</button>' },
      },
      { exportNames: ['Zebra', 'Alpha', 'Middle'] },
    )

    expect(stories.map((story) => story.exportName)).toEqual(['Zebra', 'Alpha', 'Middle'])
  })

  it('attaches source component metadata by story and meta fallback', () => {
    const stories = normalizeStoryModule(
      '../demo/button.stories.ts',
      {
        default: { title: 'CSS/Button' },
        MetaOnly: { args: { label: 'Meta' } },
        StoryOnly: { args: { label: 'Story' } },
      },
      {
        sourceMetadata: {
          metaComponentName: 'MetaButton',
          storyComponentNames: {
            StoryOnly: 'StoryButton',
          },
        },
      },
    )

    expect(stories.find((story) => story.exportName === 'MetaOnly')?.sourceComponentName).toBe(
      'MetaButton',
    )
    expect(stories.find((story) => story.exportName === 'StoryOnly')?.sourceComponentName).toBe(
      'StoryButton',
    )
  })
})

describe('groupStories', () => {
  it('keeps stories in normalized order within each component', () => {
    const stories = normalizeStoryModule(
      '../demo/button.stories.ts',
      {
        default: { title: 'CSS/Button' },
        Alpha: { name: 'Alpha', render: () => '<button>Alpha</button>' },
        Zebra: { name: 'Zebra', render: () => '<button>Zebra</button>' },
      },
      { exportNames: ['Zebra', 'Alpha'] },
    )

    expect(groupStories(stories)).toEqual([
      {
        kind: 'group',
        title: 'CSS',
        storyCount: 2,
        components: [
          {
            kind: 'component',
            title: 'Button',
            stories,
            storyCount: 2,
          },
        ],
      },
    ])
  })

  it('splits story titles into group and component levels', () => {
    const stories = normalizeStoryModule('../demo/button.stories.ts', {
      default: { title: 'UI/Button' },
      Default: { render: () => '<button>Default</button>' },
      Ghost: { render: () => '<button>Ghost</button>' },
    })

    expect(groupStories(stories)).toEqual([
      {
        kind: 'group',
        title: 'UI',
        storyCount: 2,
        components: [
          {
            kind: 'component',
            title: 'Button',
            stories,
            storyCount: 2,
          },
        ],
      },
    ])
  })

  it('keeps ungrouped components at the root level', () => {
    const stories = normalizeStoryModule('../demo/button.stories.ts', {
      default: { title: 'Button' },
      Default: { render: () => '<button>Default</button>' },
      Ghost: { render: () => '<button>Ghost</button>' },
    })

    expect(groupStories(stories)).toEqual([
      {
        kind: 'component',
        title: 'Button',
        stories,
        storyCount: 2,
      },
    ])
  })
})

describe('sortStoryTree', () => {
  const story = (title: string, exportName = 'Default', name = exportName) =>
    normalizeStoryModule(`../demo/${title.replaceAll('/', '-').toLowerCase()}.stories.ts`, {
      default: { title },
      [exportName]: { name, render: () => `<p>${title}</p>` },
    })

  const layout = (items: readonly StoryTreeItem[]) =>
    items.map((item) =>
      item.kind === 'group'
        ? { title: item.title, components: item.components.map((component) => component.title) }
        : { title: item.title, stories: item.stories.map((entry) => entry.name) },
    )

  it('returns the original tree when no order is configured', () => {
    const tree = groupStories(story('Components/Button'))
    expect(sortStoryTree(tree)).toBe(tree)
    expect(sortStoryTree(tree, null)).toBe(tree)
    expect(sortStoryTree(tree, { order: [] })).toBe(tree)
  })

  it('orders top-level items and pushes unlisted ones to the end in original order', () => {
    const tree = groupStories([
      ...story('Patterns/Card'),
      ...story('Components/Button'),
      ...story('Foundations/Colors'),
      ...story('Pages/Home'),
    ])

    const sorted = sortStoryTree(tree, { order: ['Foundations', 'Components'] })

    expect(layout(sorted).map((item) => item.title)).toEqual([
      'Foundations',
      'Components',
      'Patterns',
      'Pages',
    ])
  })

  it('orders components within a group via a nested array', () => {
    const tree = groupStories([
      ...story('Foundations/Spacing'),
      ...story('Foundations/Colors'),
      ...story('Foundations/Typography'),
    ])

    const sorted = sortStoryTree(tree, {
      order: ['Foundations', ['Colors', 'Typography', 'Spacing']],
    })

    expect(layout(sorted)).toEqual([
      { title: 'Foundations', components: ['Colors', 'Typography', 'Spacing'] },
    ])
  })

  it('honors a wildcard for unlisted items', () => {
    const tree = groupStories([
      ...story('Beta/One'),
      ...story('Intro/One'),
      ...story('Alpha/One'),
      ...story('WIP/One'),
    ])

    const sorted = sortStoryTree(tree, { order: ['Intro', '*', 'WIP'] })

    expect(layout(sorted).map((item) => item.title)).toEqual(['Intro', 'Beta', 'Alpha', 'WIP'])
  })

  it('orders stories inside a component via a deeper nested array', () => {
    const tree = groupStories(
      normalizeStoryModule('../demo/button.stories.ts', {
        default: { title: 'Components/Button' },
        Ghost: { name: 'Ghost', render: () => '<button>Ghost</button>' },
        Primary: { name: 'Primary', render: () => '<button>Primary</button>' },
        Secondary: { name: 'Secondary', render: () => '<button>Secondary</button>' },
      }),
    )

    const sorted = sortStoryTree(tree, {
      order: ['Components', ['Button', ['Primary', 'Secondary', 'Ghost']]],
    })

    expect(layout(sorted)).toEqual([{ title: 'Components', components: ['Button'] }])
    const group = sorted[0]
    if (group?.kind !== 'group') {
      throw new Error('expected a group')
    }
    expect(group.components[0]?.stories.map((entry) => entry.name)).toEqual([
      'Primary',
      'Secondary',
      'Ghost',
    ])
  })
})

describe('storyId', () => {
  it('strips the default src base directory and uses path plus export name', () => {
    expect(storyId('src/components/button.stories.ts', 'PrimaryLarge')).toBe(
      'components-button--primary-large',
    )
  })

  it('supports config-driven id rewriting from the suggested id', () => {
    expect(
      storyId('src/components/button.stories.ts', 'PrimaryLarge', (_path, suggestedId) =>
        suggestedId.replace(/^components-/, ''),
      ),
    ).toBe('button--primary-large')
  })
})

describe('normalizeStoryModulesWithDiagnostics', () => {
  it('keeps module order instead of sorting by title and story name', () => {
    const result = normalizeStoryModulesWithDiagnostics({
      'src/z.stories.ts': {
        default: { title: 'Z' },
        Last: { render: () => '<p>Last</p>' },
      },
      'src/a.stories.ts': {
        default: { title: 'A' },
        First: { render: () => '<p>First</p>' },
      },
    })

    expect(result.stories.map((story) => story.exportName)).toEqual(['Last', 'First'])
  })

  it('reports duplicate story ids', () => {
    const result = normalizeStoryModulesWithDiagnostics(
      {
        'src/a.stories.ts': {
          One: { render: () => '<p>One</p>' },
        },
        'src/b.stories.ts': {
          Two: { render: () => '<p>Two</p>' },
        },
      },
      { resolveId: () => 'duplicate' },
    )

    expect(result.idCollisions).toEqual([
      {
        id: 'duplicate',
        stories: [
          { exportName: 'One', importPath: 'src/a.stories.ts', name: 'One', title: 'a' },
          { exportName: 'Two', importPath: 'src/b.stories.ts', name: 'Two', title: 'b' },
        ],
      },
    ])
  })
})

describe('inferControlType', () => {
  it('uses explicit controls before value inference', () => {
    expect(inferControlType({ control: { type: 'color' } }, '#fff')).toBe('color')
    expect(inferControlType({ control: 'textarea' }, 'Line 1\nLine 2')).toBe('textarea')
    expect(inferControlType({ options: ['a', 'b'] }, 'a')).toBe('select')
    expect(inferControlType(undefined, true)).toBe('boolean')
  })
})
