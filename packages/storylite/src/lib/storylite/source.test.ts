import { describe, expect, it } from 'vitest'
import type { StoryLiteStory } from './types'
import { resolveStorySource } from './source'

describe('resolveStorySource', () => {
  it('returns explicit string source', () => {
    expect(resolveStorySource(story({ source: '<Demo />' }), { label: 'Changed' })).toBe('<Demo />')
  })

  it('calls explicit source with current args and context', () => {
    expect(
      resolveStorySource(
        story({
          source: (args, context) => `<Demo label="${args.label}" data-story="${context.id}" />`,
        }),
        { label: 'Changed' },
      ),
    ).toBe('<Demo label="Changed" data-story="demo--story" />')
  })

  it('uses explicit source before automatic component source', () => {
    function DemoButton() {}

    expect(
      resolveStorySource(
        story({
          component: DemoButton,
          renderer: 'react',
          source: '<CustomButton />',
        }),
        { label: 'Changed' },
      ),
    ).toBe('<CustomButton />')
  })

  it('returns null for empty source callback output', () => {
    expect(resolveStorySource(story({ source: () => '' }), { label: 'Changed' })).toBeNull()
    expect(resolveStorySource(story({ source: () => null }), { label: 'Changed' })).toBeNull()
  })

  it('returns null when explicit source callback throws', () => {
    expect(
      resolveStorySource(
        story({
          source: () => {
            throw new Error('Invalid source')
          },
        }),
        { label: 'Changed' },
      ),
    ).toBeNull()
  })

  it('generates escaped web-component source from primitive args', () => {
    expect(
      resolveStorySource(
        story({
          component: 'demo-button',
          renderer: 'web-components',
        }),
        {
          label: 'Save & close',
          disabled: true,
          count: 2,
          hidden: false,
          object: { ignored: true },
        },
      ),
    ).toBe(
      '<demo-button label="Save &amp; close" disabled count="2">Save &amp; close</demo-button>',
    )
  })

  it('uses string output from HTML render stories', () => {
    expect(
      resolveStorySource(
        story({
          render: (args) => `<button>${args.label}</button>`,
        }),
        { label: 'Save' },
      ),
    ).toBe('<button>Save</button>')
  })

  it('generates JSX source for named component stories', () => {
    function ReactButton() {}

    expect(
      resolveStorySource(
        story({
          component: ReactButton,
          renderer: 'react',
          sourceComponentName: 'ReactButton',
        }),
        { label: 'Save', disabled: false },
      ),
    ).toBe('<ReactButton label={"Save"} disabled={false} />')
  })

  it('generates Svelte source for named component stories', () => {
    function SvelteButton() {}

    expect(
      resolveStorySource(
        story({
          component: SvelteButton,
          renderer: 'svelte',
          sourceComponentName: 'SvelteButton',
        }),
        { label: 'Save', disabled: false },
      ),
    ).toBe('<SvelteButton label="Save" disabled={false} />')
  })

  it('generates Vue source using kebab-case bound props', () => {
    expect(
      resolveStorySource(
        story({
          component: { __name: 'VueButton' },
          renderer: 'vue',
          sourceComponentName: 'VueButton',
        }),
        { activeItem: 'Docs', disabled: false },
      ),
    ).toBe('<VueButton active-item="Docs" :disabled="false" />')
  })

  it('generates source from a component render output', () => {
    function ReactButton() {}

    expect(
      resolveStorySource(
        story({
          renderer: 'react',
          sourceComponentName: 'ReactButton',
          render: (args) => ({
            type: ReactButton,
            props: { label: args.label, disabled: args.disabled },
          }),
        }),
        { label: 'Save', disabled: true },
      ),
    ).toBe('<ReactButton label={"Save"} disabled={true} />')
  })

  it('falls back to current args when render output cannot be inspected', () => {
    expect(
      resolveStorySource(
        story({
          renderer: 'react',
          sourceComponentName: 'Card',
          render: () => ({ props: { title: 'Ignored render props' } }),
        }),
        { eyebrow: 'Smoke', title: 'Fallback args' },
      ),
    ).toBe('<Card eyebrow={"Smoke"} title={"Fallback args"} />')
  })

  it('uses stable source metadata instead of minified runtime component names', () => {
    function bs() {}

    expect(
      resolveStorySource(
        story({
          renderer: 'preact',
          sourceComponentName: 'Card',
          render: (args) => ({
            type: bs,
            props: { eyebrow: args.eyebrow, title: args.title },
          }),
        }),
        { eyebrow: 'Adapter', title: 'Preact renderer' },
      ),
    ).toBe('<Card eyebrow={"Adapter"} title={"Preact renderer"} />')
  })

  it('returns null for framework component stories without stable source metadata', () => {
    function ReactButton() {}

    expect(
      resolveStorySource(
        story({
          component: ReactButton,
          renderer: 'react',
        }),
        { label: 'Save' },
      ),
    ).toBeNull()
  })

  it('returns null when no reliable source is available', () => {
    expect(resolveStorySource(story({ renderer: 'react' }), { label: 'Changed' })).toBeNull()
  })
})

function story(overrides: Partial<StoryLiteStory>): StoryLiteStory {
  return {
    id: 'demo--story',
    importPath: 'src/demo.stories.ts',
    exportName: 'Story',
    title: 'Demo',
    name: 'Story',
    args: {},
    argTypes: {},
    parameters: {},
    renderer: 'html',
    ...overrides,
  }
}
