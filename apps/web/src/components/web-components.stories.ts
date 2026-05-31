import type {
  StoryLiteMeta,
  StoryLiteParameters,
  StoryLiteStoryDefinition,
} from '@storylite/storylite'
import css from '../styles.css?raw'

const parameters = {
  css,
  renderer: 'web-components',
  defineCustomElements,
} satisfies StoryLiteParameters

export default {
  title: 'Examples/Web Components',
  parameters,
} satisfies StoryLiteMeta

type DropdownArgs = {
  label: string
  activeItem: 'README' | 'Configuration' | 'Static build'
}

type CopyCommandArgs = {
  label: string
  command: string
}

type ModeSwitchArgs = {
  label: string
  checked: boolean
}

type StoryWindow = Window & Pick<typeof globalThis, 'HTMLElement' | 'Node'>

export const DropdownMenu = {
  component: 'sl-dropdown-menu',
  args: {
    label: 'StoryLite resources',
    activeItem: 'README',
  },
  argTypes: {
    label: { control: 'text' },
    activeItem: { control: 'select', options: ['README', 'Configuration', 'Static build'] },
  },
} satisfies StoryLiteStoryDefinition<DropdownArgs>

export const CopyCommand = {
  component: 'sl-copy-command',
  args: {
    label: 'Install StoryLite',
    command: 'pnpm add -D @storylite/storylite',
  },
  argTypes: {
    label: { control: 'text' },
    command: { control: 'text' },
  },
} satisfies StoryLiteStoryDefinition<CopyCommandArgs>

export const PreviewModeSwitch = {
  component: 'sl-mode-switch',
  args: {
    label: 'Show static output mode',
    checked: true,
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
  },
} satisfies StoryLiteStoryDefinition<ModeSwitchArgs>

function defineCustomElements(window: Window): void {
  defineDropdownMenu(window)
  defineCopyCommand(window)
  defineModeSwitch(window)
}

function defineDropdownMenu(window: Window): void {
  const win = window as StoryWindow

  if (win.customElements.get('sl-dropdown-menu')) {
    return
  }

  const BaseElement = win.HTMLElement

  class StoryLiteDropdownMenu extends BaseElement {
    static get observedAttributes(): string[] {
      return ['open']
    }

    private trigger: HTMLButtonElement | null = null

    private readonly onTriggerClick = () => {
      this.toggleAttribute('open')
    }

    private readonly onDocumentClick = (event: Event) => {
      if (event.target instanceof win.Node && !this.contains(event.target)) {
        this.removeAttribute('open')
      }
    }

    private readonly onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.removeAttribute('open')
        this.trigger?.focus()
      }
    }

    connectedCallback(): void {
      if (!this.querySelector('[data-dropdown-trigger]')) {
        this.renderLightDom()
      }

      this.trigger = this.querySelector('[data-dropdown-trigger]')
      this.setAttribute('data-enhanced', '')
      this.trigger?.setAttribute('aria-haspopup', 'menu')
      this.trigger?.addEventListener('click', this.onTriggerClick)
      this.addEventListener('keydown', this.onKeyDown)
      this.ownerDocument.addEventListener('click', this.onDocumentClick)
      this.syncOpenState()
    }

    disconnectedCallback(): void {
      this.trigger?.removeEventListener('click', this.onTriggerClick)
      this.removeEventListener('keydown', this.onKeyDown)
      this.ownerDocument.removeEventListener('click', this.onDocumentClick)
    }

    attributeChangedCallback(): void {
      this.syncOpenState()
    }

    private syncOpenState(): void {
      this.trigger?.setAttribute('aria-expanded', String(this.hasAttribute('open')))
    }

    private renderLightDom(): void {
      const label = stringProperty(this, 'label', 'label', 'StoryLite resources')
      const activeItem = stringProperty(this, 'activeItem', 'active-item', 'README')
      const items = [
        ['README', '#readme', 'Product overview and install flow'],
        ['Configuration', '#configuration', 'Project stories, CSS, and renderers'],
        ['Static build', '#static-build', 'Pre-rendered manager and story pages'],
      ] as const
      const document = this.ownerDocument
      const trigger = document.createElement('button')
      const triggerLabel = document.createElement('span')
      const chevron = document.createElement('span')
      const menu = document.createElement('div')

      this.classList.add('demo-dropdown')
      trigger.className = 'demo-menu-trigger'
      trigger.type = 'button'
      trigger.dataset.dropdownTrigger = ''
      triggerLabel.textContent = label
      chevron.className = 'demo-menu-trigger__chevron'
      chevron.setAttribute('aria-hidden', 'true')
      chevron.textContent = 'v'
      trigger.append(triggerLabel, chevron)

      menu.className = 'demo-dropdown__menu'
      menu.setAttribute('role', 'menu')
      menu.setAttribute('aria-label', label)

      for (const [itemLabel, href, description] of items) {
        const item = document.createElement('a')
        const itemTitle = document.createElement('span')
        const itemDescription = document.createElement('small')

        item.href = href
        item.setAttribute('role', 'menuitem')

        if (itemLabel === activeItem) {
          item.setAttribute('aria-current', 'page')
        }

        itemTitle.textContent = itemLabel
        itemDescription.textContent = description
        item.append(itemTitle, itemDescription)
        menu.append(item)
      }

      this.replaceChildren(trigger, menu)
    }
  }

  win.customElements.define('sl-dropdown-menu', StoryLiteDropdownMenu)
}

function defineCopyCommand(window: Window): void {
  const win = window as StoryWindow

  if (win.customElements.get('sl-copy-command')) {
    return
  }

  const BaseElement = win.HTMLElement

  class StoryLiteCopyCommand extends BaseElement {
    private button: HTMLButtonElement | null = null
    private resetTimer: number | undefined

    private readonly onCopy = async () => {
      const value = this.querySelector('[data-copy-value]')?.textContent?.trim()

      if (!value) {
        return
      }

      await window.navigator.clipboard?.writeText(value)
      this.showStatus('Copied')
    }

    connectedCallback(): void {
      if (!this.querySelector('[data-copy-button]')) {
        this.renderLightDom()
      }

      this.button = this.querySelector('[data-copy-button]')
      this.setAttribute('data-enhanced', '')
      this.button?.addEventListener('click', this.onCopy)
    }

    disconnectedCallback(): void {
      this.button?.removeEventListener('click', this.onCopy)
      window.clearTimeout(this.resetTimer)
    }

    private showStatus(message: string): void {
      const status = this.querySelector('[data-copy-status]')

      if (status) {
        status.textContent = message
      }

      if (this.button) {
        this.button.textContent = message
      }

      window.clearTimeout(this.resetTimer)
      this.resetTimer = window.setTimeout(() => {
        if (status) {
          status.textContent = ''
        }

        if (this.button) {
          this.button.textContent = 'Copy'
        }
      }, 1600)
    }

    private renderLightDom(): void {
      const document = this.ownerDocument
      const label = document.createElement('span')
      const command = document.createElement('code')
      const button = document.createElement('button')
      const status = document.createElement('span')

      this.classList.add('demo-command')
      label.className = 'demo-command__label'
      label.textContent = stringProperty(this, 'label', 'label', 'Install StoryLite')
      command.dataset.copyValue = ''
      command.textContent = stringProperty(
        this,
        'command',
        'command',
        'pnpm add -D @storylite/storylite',
      )
      button.className = 'demo-btn'
      button.dataset.variant = 'secondary'
      button.type = 'button'
      button.dataset.copyButton = ''
      button.textContent = 'Copy'
      status.className = 'demo-command__status'
      status.setAttribute('aria-live', 'polite')
      status.dataset.copyStatus = ''
      this.replaceChildren(label, command, button, status)
    }
  }

  win.customElements.define('sl-copy-command', StoryLiteCopyCommand)
}

function defineModeSwitch(window: Window): void {
  const win = window as StoryWindow

  if (win.customElements.get('sl-mode-switch')) {
    return
  }

  const BaseElement = win.HTMLElement

  class StoryLiteModeSwitch extends BaseElement {
    static get observedAttributes(): string[] {
      return ['checked']
    }

    private control: HTMLButtonElement | null = null

    private readonly onToggle = () => {
      this.toggleAttribute('checked')
    }

    connectedCallback(): void {
      if (!this.querySelector('[data-switch-control]')) {
        this.renderLightDom()
      }

      this.control = this.querySelector('[data-switch-control]')
      this.setAttribute('data-enhanced', '')
      this.control?.addEventListener('click', this.onToggle)
      this.syncCheckedState()
    }

    disconnectedCallback(): void {
      this.control?.removeEventListener('click', this.onToggle)
    }

    attributeChangedCallback(): void {
      this.syncCheckedState()
    }

    private syncCheckedState(): void {
      this.control?.setAttribute('aria-checked', String(this.hasAttribute('checked')))
    }

    private renderLightDom(): void {
      const document = this.ownerDocument
      const control = document.createElement('button')
      const track = document.createElement('span')
      const label = document.createElement('span')
      const copy = document.createElement('p')

      this.classList.add('demo-mode-switch')
      control.type = 'button'
      control.setAttribute('role', 'switch')
      control.dataset.switchControl = ''
      track.className = 'demo-mode-switch__track'
      track.setAttribute('aria-hidden', 'true')
      label.textContent = stringProperty(this, 'label', 'label', 'Show static output mode')
      copy.dataset.switchCopy = ''
      copy.textContent =
        'Static output mode keeps every story reachable as its own generated HTML page.'
      control.append(track, label)
      this.replaceChildren(control, copy)
    }
  }

  win.customElements.define('sl-mode-switch', StoryLiteModeSwitch)
}

function stringProperty(
  element: Element,
  property: string,
  attribute: string,
  fallback: string,
): string {
  const value = (element as unknown as Record<string, unknown>)[property]

  if (typeof value === 'string' && value) {
    return value
  }

  return element.getAttribute(attribute) ?? fallback
}
