import styles from './styles.css?raw'
import { Badge, Button, Card, Field, Layout } from './components/basic.stories'
import { defineCustomElements } from './components/elements'

const app = document.getElementById('app')

if (!app) {
  throw new Error('Missing #app')
}

const style = document.createElement('style')
style.textContent = styles
document.head.append(style)
defineCustomElements(window)

app.innerHTML = `
  <div class="demo-home">
    <section class="demo-section">
      <header>
        <p class="eyebrow">HTML templates</p>
        <h1>Plain HTML components styled with layered CSS</h1>
      </header>
      ${Button.render?.(Button.args ?? {}) ?? ''}
      ${Card.render?.(Card.args ?? {}) ?? ''}
      ${Field.render?.(Field.args ?? {}) ?? ''}
      ${Badge.render?.(Badge.args ?? {}) ?? ''}
      ${Layout.render?.(Layout.args ?? {}) ?? ''}
    </section>

    <section class="demo-section wc-demo-page">
      <header>
        <p class="eyebrow">Web components</p>
        <h2>Light DOM custom elements with adapter-free stories</h2>
      </header>

      <div class="wc-row">
        <sl-demo-button variant="primary">Save recipe</sl-demo-button>
        <sl-demo-button variant="secondary">Preview batch</sl-demo-button>
      </div>

      <sl-demo-alert tone="success">
        <strong>Synced</strong>
        <span>Your components keep their light-DOM content before and after upgrade.</span>
      </sl-demo-alert>

      <sl-demo-disclosure open>
        <button type="button">What gets enhanced?</button>
        <div>JavaScript adds keyboard and ARIA behavior. The content remains present without it.</div>
      </sl-demo-disclosure>

      <sl-demo-meter label="Coverage" value="72" accent="#0f766e">Coverage</sl-demo-meter>
    </section>
  </div>
`
