import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, mergeConfig } from 'vitest/config'
import rootConfig from '../../vitest.config.js'

export default mergeConfig(
  rootConfig,
  defineConfig({
    plugins: [svelte()],
    test: {
      server: {
        deps: {
          inline: [/^svelte/],
        },
      },
    },
  }),
)
