import { createRoot } from 'react-dom/client'
import css from './styles.css?raw'
import { DemoPage } from './components/DemoPage'

const app = document.getElementById('app')

if (!app) {
  throw new Error('Missing #app')
}

const style = document.createElement('style')
style.textContent = css
document.head.append(style)

createRoot(app).render(<DemoPage />)
