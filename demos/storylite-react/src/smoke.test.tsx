import { describe, expect, it } from 'vitest'
import meta, { Button, Card, Layout } from './components/react.stories'

describe('storylite-react demo', () => {
  it('exports React stories', () => {
    expect(meta.parameters?.renderer).toBe('react')
    expect(Button.render).toBeTypeOf('function')
    expect(Card.render).toBeTypeOf('function')
    expect(Layout.render).toBeTypeOf('function')
  })
})
