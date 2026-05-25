import { describe, expect, it } from 'vitest'
import meta, { Button, Card, Stats } from './components/preact.stories'

describe('storylite-preact demo', () => {
  it('exports Preact stories', () => {
    expect(meta.parameters?.renderer).toBe('preact')
    expect(Button.render).toBeTypeOf('function')
    expect(Card.render).toBeTypeOf('function')
    expect(Stats.render).toBeTypeOf('function')
  })
})
