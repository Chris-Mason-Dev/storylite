type DemoWindow = Window & typeof globalThis

export function defineCustomElements(targetWindow: Window = window): void {
  defineDemoButton(targetWindow as DemoWindow)
  defineDemoAlert(targetWindow as DemoWindow)
  defineDemoDisclosure(targetWindow as DemoWindow)
  defineDemoMeter(targetWindow as DemoWindow)
}

function defineDemoButton(targetWindow: DemoWindow): void {
  if (targetWindow.customElements.get('sl-demo-button')) {
    return
  }

  class DemoButton extends targetWindow.HTMLElement {
    connectedCallback(): void {
      this.setAttribute('role', 'button')
      this.tabIndex = this.hasAttribute('disabled') ? -1 : 0
      this.setAttribute('aria-disabled', String(this.hasAttribute('disabled')))
      this.addEventListener('keydown', this.#onKeydown)
    }

    disconnectedCallback(): void {
      this.removeEventListener('keydown', this.#onKeydown)
    }

    #onKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        this.click()
      }
    }
  }

  targetWindow.customElements.define('sl-demo-button', DemoButton)
}

function defineDemoAlert(targetWindow: DemoWindow): void {
  if (targetWindow.customElements.get('sl-demo-alert')) {
    return
  }

  class DemoAlert extends targetWindow.HTMLElement {
    connectedCallback(): void {
      this.setAttribute('role', this.getAttribute('role') ?? 'status')
    }
  }

  targetWindow.customElements.define('sl-demo-alert', DemoAlert)
}

function defineDemoDisclosure(targetWindow: DemoWindow): void {
  if (targetWindow.customElements.get('sl-demo-disclosure')) {
    return
  }

  class DemoDisclosure extends targetWindow.HTMLElement {
    connectedCallback(): void {
      this.button?.setAttribute('aria-expanded', String(this.hasAttribute('open')))
      this.button?.addEventListener('click', this.#toggle)
    }

    disconnectedCallback(): void {
      this.button?.removeEventListener('click', this.#toggle)
    }

    get button(): HTMLButtonElement | null {
      return this.querySelector('button')
    }

    #toggle = (): void => {
      this.toggleAttribute('open')
      this.button?.setAttribute('aria-expanded', String(this.hasAttribute('open')))
    }
  }

  targetWindow.customElements.define('sl-demo-disclosure', DemoDisclosure)
}

function defineDemoMeter(targetWindow: DemoWindow): void {
  if (targetWindow.customElements.get('sl-demo-meter')) {
    return
  }

  class DemoMeter extends targetWindow.HTMLElement {
    static observedAttributes = ['value', 'accent']

    connectedCallback(): void {
      this.#sync()
    }

    attributeChangedCallback(): void {
      this.#sync()
    }

    #sync(): void {
      const value = Number(this.getAttribute('value') ?? '50')
      const normalized = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50
      const accent = this.getAttribute('accent')

      this.style.setProperty('--meter-value', String(normalized))
      if (accent) {
        this.style.setProperty('--meter-accent', accent)
      }
      this.setAttribute('role', 'meter')
      this.setAttribute('aria-valuemin', '0')
      this.setAttribute('aria-valuemax', '100')
      this.setAttribute('aria-valuenow', String(normalized))
    }
  }

  targetWindow.customElements.define('sl-demo-meter', DemoMeter)
}
