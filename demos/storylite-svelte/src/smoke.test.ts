import { describe, expect, it } from 'vitest'
import meta, { Button, Card, Stat } from './components/svelte.stories'

describe('storylite-svelte demo', () => {
  it('exports Svelte stories', () => {
    expect(meta.parameters?.renderer).toBe('svelte')
    expect(Button.component).toBeTypeOf('function')
    expect(Card.component).toBeTypeOf('function')
    expect(Stat.component).toBeTypeOf('function')
  })
})
