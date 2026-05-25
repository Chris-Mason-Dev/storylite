import { render as renderSvelte } from 'svelte/server'
import App from './App.svelte'

export type PrerenderedStoryLiteApp = {
  readonly head: string
  readonly html: string
}

export function render(): PrerenderedStoryLiteApp {
  const { body, head } = renderSvelte(App)
  return { head, html: body }
}
