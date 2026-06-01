import { describe, expect, it } from 'vitest'
import { Button, Card, Field } from './components/basic.stories'
import { Default as SingleDefault } from './components/single-default.stories'
import { ReadyState } from './components/single-named.stories'
import { CopyCommand, DropdownMenu, PreviewModeSwitch } from './components/web-components.stories'

describe('storylite demo', () => {
  it('exports HTML stories', () => {
    expect(Button.render?.(Button.args ?? {})).toContain('demo-btn')
    expect(Card.render?.(Card.args ?? {})).toContain('demo-card')
    expect(Field.render?.(Field.args ?? {})).toContain('demo-field')
    expect(
      SingleDefault.render?.({
        eyebrow: 'Release review',
        title: 'Ship one focused state',
        body: 'Review final screenshots, controls, and static output before promoting the release.',
        action: 'Open preview',
      }),
    ).toContain('demo-card')
    expect(
      ReadyState.render?.({
        label: 'Ready',
        tone: 'stable',
        title: 'Named export state',
        body: 'Package checks are green and the release candidate is ready for visual review.',
      }),
    ).toContain('demo-badge')
  })

  it('exports light-DOM web component stories', () => {
    expect(DropdownMenu.component).toBe('sl-dropdown-menu')
    expect(CopyCommand.component).toBe('sl-copy-command')
    expect(PreviewModeSwitch.component).toBe('sl-mode-switch')
  })
})
