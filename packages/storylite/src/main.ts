import { hydrate, mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const target = document.getElementById('app')

if (target === null) {
  throw new Error('Missing #app mount target')
}

const createApp = target.hasChildNodes() ? hydrate : mount
const app = createApp(App, {
  target,
})

export default app
