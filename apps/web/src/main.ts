import styles from './styles.css?raw'
import { Badge, Button, Card, Field, Layout } from './components/basic.stories'

const app = document.getElementById('app')

if (!app) {
  throw new Error('Missing #app')
}

const style = document.createElement('style')
style.textContent = styles
document.head.append(style)

app.innerHTML = `
  <section class="demo-home">
    <header>
      <p class="eyebrow">StoryLite demo</p>
      <h1>Lightweight component stories for HTML and framework adapters</h1>
    </header>
    ${Button.render?.(Button.args ?? {}) ?? ''}
    ${Card.render?.(Card.args ?? {}) ?? ''}
    ${Field.render?.(Field.args ?? {}) ?? ''}
    ${Badge.render?.(Badge.args ?? {}) ?? ''}
    ${Layout.render?.(Layout.args ?? {}) ?? ''}
  </section>
`
