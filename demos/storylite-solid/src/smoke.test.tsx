import { describe, expect, it } from 'vitest'
import meta, { Button, Card, List } from './components/solid.stories'

describe('storylite-solid demo', () => {
  it('exports Solid stories', () => {
    expect(meta.parameters?.renderer).toBe('solid')
    expect(Button.component).toBeTypeOf('function')
    expect(Card.component).toBeTypeOf('function')
    expect(List.component).toBeTypeOf('function')
  })
})
