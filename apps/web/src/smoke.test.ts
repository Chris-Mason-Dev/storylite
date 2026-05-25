import { describe, expect, it } from 'vitest'
import { Button, Card, Field } from './components/basic.stories'
import { CopyCommand, DropdownMenu, PreviewModeSwitch } from './components/web-components.stories'

describe('storylite demo', () => {
  it('exports HTML stories', () => {
    expect(Button.render?.(Button.args ?? {})).toContain('demo-btn')
    expect(Card.render?.(Card.args ?? {})).toContain('demo-card')
    expect(Field.render?.(Field.args ?? {})).toContain('demo-field')
  })

  it('exports light-DOM web component stories', () => {
    expect(DropdownMenu.component).toBe('sl-dropdown-menu')
    expect(CopyCommand.component).toBe('sl-copy-command')
    expect(PreviewModeSwitch.component).toBe('sl-mode-switch')
  })
})
