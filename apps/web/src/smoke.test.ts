import { describe, expect, it } from 'vitest'
import { Button, Card, Field } from './components/basic.stories'

describe('storylite demo', () => {
  it('exports HTML stories', () => {
    expect(Button.render?.(Button.args ?? {})).toContain('demo-btn')
    expect(Card.render?.(Card.args ?? {})).toContain('demo-card')
    expect(Field.render?.(Field.args ?? {})).toContain('demo-field')
  })
})
