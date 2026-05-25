import { describe, expect, it } from 'vitest'
import {
  inferControlType,
  normalizeStoryModule,
  normalizeStoryModulesWithDiagnostics,
  storyId,
} from './normalize'

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
    expect(inferControlType({ options: ['a', 'b'] }, 'a')).toBe('select')
    expect(inferControlType(undefined, true)).toBe('boolean')
  })
})
