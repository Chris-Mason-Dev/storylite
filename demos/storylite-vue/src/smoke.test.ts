import { describe, expect, it } from 'vitest'
import meta, { Button, Card, Field } from './components/vue.stories'

describe('storylite-vue demo', () => {
  it('exports Vue stories', () => {
    expect(meta.parameters?.renderer).toBe('vue')
    expect(Button.component).toBeTruthy()
    expect(Card.component).toBeTruthy()
    expect(Field.component).toBeTruthy()
  })
})
