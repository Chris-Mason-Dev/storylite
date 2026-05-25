<script lang="ts">
  import { onDestroy } from 'svelte'
  import Accessibility from '@lucide/svelte/icons/accessibility'
  import Bug from '@lucide/svelte/icons/bug'
  import Check from '@lucide/svelte/icons/check'
  import Copy from '@lucide/svelte/icons/copy'
  import Eye from '@lucide/svelte/icons/eye'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import Expand from '@lucide/svelte/icons/expand'
  import Flag from '@lucide/svelte/icons/flag'
  import Globe from '@lucide/svelte/icons/globe'
  import Home from '@lucide/svelte/icons/home'
  import Info from '@lucide/svelte/icons/info'
  import Laptop from '@lucide/svelte/icons/laptop'
  import Layout from '@lucide/svelte/icons/layout'
  import Monitor from '@lucide/svelte/icons/monitor'
  import Moon from '@lucide/svelte/icons/moon'
  import Shrink from '@lucide/svelte/icons/shrink'
  import Smartphone from '@lucide/svelte/icons/smartphone'
  import Settings from '@lucide/svelte/icons/settings'
  import Sun from '@lucide/svelte/icons/sun'
  import Tablet from '@lucide/svelte/icons/tablet'
  import PaintBucket from '@lucide/svelte/icons/paint-bucket'
  import Zap from '@lucide/svelte/icons/zap'
  import ZoomIn from '@lucide/svelte/icons/zoom-in'
  import type {
    StoryLiteBackgroundPreset,
    StoryLiteIconName,
    StoryLiteToolbarTool,
  } from '../../public'
  import type { ViewportPreset } from '../storylite/app-types'
  import { storyliteSettings, storyliteZoomLevels } from '../storylite/settings.svelte'
  import { resolveStorySource } from '../storylite/source'
  import type { StoryArgs, StoryLiteStory } from '../storylite/types'

  type Props = {
    readonly viewports: readonly ViewportPreset[]
    readonly backgrounds: readonly StoryLiteBackgroundPreset[]
    readonly toolbar: readonly StoryLiteToolbarTool[]
    readonly activeStory: StoryLiteStory | undefined
    readonly activeArgs: StoryArgs
    readonly hasHome: boolean
    readonly staticStoriesBase: string
  }

  const uid = $props.id()

  let {
    viewports,
    backgrounds,
    toolbar,
    activeStory,
    activeArgs,
    hasHome,
    staticStoriesBase,
  }: Props = $props()
  let copiedStoryId: string | null = $state(null)
  let copyResetTimer: ReturnType<typeof setTimeout> | null = null

  const viewportPopoverId = `${uid}-viewport-popover`
  const backgroundPopoverId = `${uid}-background-popover`
  const zoomPopoverId = `${uid}-zoom-popover`

  const canvasUrl = $derived(
    activeStory
      ? import.meta.env.PROD
        ? `${staticStoriesBase}${activeStory.id}/`
        : `#/canvas/${encodeURIComponent(activeStory.id)}`
      : '#/',
  )
  const defaultBackground = $derived(backgrounds[0]?.value ?? '')
  const hasCustomBackground = $derived(
    Boolean(defaultBackground) && storyliteSettings.background !== defaultBackground,
  )
  const defaultViewport = $derived(viewports[0]?.width ?? '100%')
  const activeViewport = $derived(
    viewports.find((viewport) => viewport.width === storyliteSettings.viewport) ?? viewports[0],
  )
  const hasCustomViewport = $derived(
    Boolean(defaultViewport) && storyliteSettings.viewport !== defaultViewport,
  )
  const hasCustomZoom = $derived(storyliteSettings.zoom !== 100)
  const sourceSnippet = $derived(activeStory ? resolveStorySource(activeStory, activeArgs) : null)
  const didCopySource = $derived(Boolean(activeStory && copiedStoryId === activeStory.id))

  onDestroy(() => {
    if (copyResetTimer) {
      window.clearTimeout(copyResetTimer)
    }
  })

  function viewportTitle(viewport: ViewportPreset): string {
    return viewport.icon === 'fluid' ? viewport.label : `${viewport.label} (${viewport.width})`
  }

  function customPopoverId(toolId: string): string {
    return `${uid}-custom-${toolId}-popover`
  }

  function setCustomToolValue(toolId: string, value: boolean | string): void {
    storyliteSettings.customTools = {
      ...storyliteSettings.customTools,
      [toolId]: value,
    }
  }

  async function copyStorySource(): Promise<void> {
    if (!activeStory || !sourceSnippet) {
      return
    }

    try {
      await navigator.clipboard.writeText(sourceSnippet)
      copiedStoryId = activeStory.id

      if (copyResetTimer) {
        window.clearTimeout(copyResetTimer)
      }

      const copiedId = activeStory.id
      copyResetTimer = window.setTimeout(() => {
        if (copiedStoryId === copiedId) {
          copiedStoryId = null
        }
        copyResetTimer = null
      }, 1200)
    } catch {
      copiedStoryId = null
    }
  }
</script>

{#snippet viewportIcon(icon: ViewportPreset['icon'])}
  {#if icon === 'fluid'}
    <Monitor size={16} aria-hidden="true" />
  {:else if icon === 'mobile'}
    <Smartphone size={16} aria-hidden="true" />
  {:else if icon === 'tablet'}
    <Tablet size={16} aria-hidden="true" />
  {:else}
    <Laptop size={16} aria-hidden="true" />
  {/if}
{/snippet}

{#snippet toolIcon(icon: StoryLiteIconName | undefined, fallback: 'link' | 'select' | 'toggle')}
  {#if icon === 'accessibility'}
    <Accessibility size={16} aria-hidden="true" />
  {:else if icon === 'bug'}
    <Bug size={16} aria-hidden="true" />
  {:else if icon === 'external-link'}
    <ExternalLink size={16} aria-hidden="true" />
  {:else if icon === 'eye'}
    <Eye size={16} aria-hidden="true" />
  {:else if icon === 'flag'}
    <Flag size={16} aria-hidden="true" />
  {:else if icon === 'globe'}
    <Globe size={16} aria-hidden="true" />
  {:else if icon === 'info'}
    <Info size={16} aria-hidden="true" />
  {:else if icon === 'layout'}
    <Layout size={16} aria-hidden="true" />
  {:else if icon === 'monitor'}
    <Monitor size={16} aria-hidden="true" />
  {:else if icon === 'moon'}
    <Moon size={16} aria-hidden="true" />
  {:else if icon === 'paint-bucket'}
    <PaintBucket size={16} aria-hidden="true" />
  {:else if icon === 'settings'}
    <Settings size={16} aria-hidden="true" />
  {:else if icon === 'sun'}
    <Sun size={16} aria-hidden="true" />
  {:else if icon === 'zap'}
    <Zap size={16} aria-hidden="true" />
  {:else if fallback === 'link'}
    <ExternalLink size={16} aria-hidden="true" />
  {:else if fallback === 'select'}
    <Settings size={16} aria-hidden="true" />
  {:else}
    <Eye size={16} aria-hidden="true" />
  {/if}
{/snippet}

<header class="toolbar">
  {#if hasHome}
    <a class="toolbar__icon-button" href="#/" aria-label="Open StoryLite home" title="Home">
      <Home size={16} aria-hidden="true" />
    </a>
  {/if}

  <div class="toolbar__group toolbar__group--segmented" aria-label="Canvas display">
    <button
      type="button"
      class:active={hasCustomViewport}
      popovertarget={viewportPopoverId}
      aria-label="Choose viewport"
      title={activeViewport ? viewportTitle(activeViewport) : 'Viewport'}
    >
      {#if activeViewport}
        {@render viewportIcon(activeViewport.icon)}
      {:else}
        <Monitor size={16} aria-hidden="true" />
      {/if}
    </button>

    <button
      type="button"
      class:active={hasCustomZoom}
      popovertarget={zoomPopoverId}
      aria-label="Choose canvas zoom"
      title="Canvas zoom"
    >
      <ZoomIn size={16} aria-hidden="true" />
    </button>
  </div>

  <div class="toolbar-dropdown__panel" id={viewportPopoverId} popover="auto" aria-label="Viewports">
    {#each viewports as viewport (viewport.width)}
      <button
        type="button"
        class="toolbar-dropdown__item"
        class:active={storyliteSettings.viewport === viewport.width}
        popovertarget={viewportPopoverId}
        popovertargetaction="hide"
        title={viewportTitle(viewport)}
        onclick={() => (storyliteSettings.viewport = viewport.width)}
      >
        {@render viewportIcon(viewport.icon)}
        <span>{viewport.label}</span>
        {#if viewport.icon !== 'fluid'}
          <small>{viewport.width}</small>
        {/if}
      </button>
    {/each}
  </div>

  <div
    class="toolbar-dropdown__panel"
    id={backgroundPopoverId}
    popover="auto"
    aria-label="Canvas backgrounds"
  >
    {#each backgrounds as background (background.label)}
      <button
        type="button"
        class="toolbar-dropdown__item"
        class:active={storyliteSettings.background === background.value}
        popovertarget={backgroundPopoverId}
        popovertargetaction="hide"
        onclick={() => (storyliteSettings.background = background.value)}
      >
        <span
          class="toolbar-dropdown__swatch"
          style:background={background.value}
          data-preview-theme={storyliteSettings.previewTheme}
          aria-hidden="true"
        ></span>
        <span>{background.label}</span>
      </button>
    {/each}
  </div>

  <div class="toolbar-dropdown__panel" id={zoomPopoverId} popover="auto" aria-label="Canvas zoom">
    {#each storyliteZoomLevels as zoom (zoom)}
      <button
        type="button"
        class="toolbar-dropdown__item"
        class:active={storyliteSettings.zoom === zoom}
        popovertarget={zoomPopoverId}
        popovertargetaction="hide"
        onclick={() => (storyliteSettings.zoom = zoom)}
      >
        <span>{zoom}%</span>
      </button>
    {/each}
  </div>

  <button
    type="button"
    class="toolbar__icon-button toolbar-dropdown__trigger"
    class:active={hasCustomBackground}
    popovertarget={backgroundPopoverId}
    aria-label="Choose canvas background"
    title="Canvas background"
  >
    <PaintBucket size={16} aria-hidden="true" />
  </button>

  <div class="toolbar__group toolbar__group--segmented" aria-label="Theme">
    <button
      type="button"
      class:active={storyliteSettings.previewTheme === 'light'}
      aria-label="Use light theme"
      title="Light"
      onclick={() => (storyliteSettings.previewTheme = 'light')}
    >
      <Sun size={16} aria-hidden="true" />
    </button>
    <button
      type="button"
      class:active={storyliteSettings.previewTheme === 'dark'}
      aria-label="Use dark theme"
      title="Dark"
      onclick={() => (storyliteSettings.previewTheme = 'dark')}
    >
      <Moon size={16} aria-hidden="true" />
    </button>
  </div>

  {#if toolbar.length > 0}
    <div class="toolbar__group toolbar__group--segmented" aria-label="Custom tools">
      {#each toolbar as tool (tool.id)}
        {#if tool.type === 'toggle'}
          <button
            type="button"
            class:active={storyliteSettings.customTools[tool.id] === true}
            aria-label={tool.label}
            aria-pressed={storyliteSettings.customTools[tool.id] === true}
            title={tool.label}
            onclick={() =>
              setCustomToolValue(tool.id, storyliteSettings.customTools[tool.id] !== true)}
          >
            {@render toolIcon(tool.icon, 'toggle')}
          </button>
        {:else if tool.type === 'link'}
          <a
            href={tool.href}
            target={tool.target}
            rel={tool.rel}
            aria-label={tool.label}
            title={tool.label}
          >
            {@render toolIcon(tool.icon, 'link')}
          </a>
        {:else}
          <button
            type="button"
            class:active={storyliteSettings.customTools[tool.id] !== tool.defaultValue}
            popovertarget={customPopoverId(tool.id)}
            aria-label={tool.label}
            title={tool.label}
          >
            {@render toolIcon(tool.icon, 'select')}
          </button>
        {/if}
      {/each}
    </div>

    {#each toolbar as tool (tool.id)}
      {#if tool.type === 'select'}
        <div
          class="toolbar-dropdown__panel"
          id={customPopoverId(tool.id)}
          popover="auto"
          aria-label={tool.label}
        >
          {#each tool.options as option (option.value)}
            <button
              type="button"
              class="toolbar-dropdown__item"
              class:active={storyliteSettings.customTools[tool.id] === option.value}
              popovertarget={customPopoverId(tool.id)}
              popovertargetaction="hide"
              onclick={() => setCustomToolValue(tool.id, option.value)}
            >
              <span>{option.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    {/each}
  {/if}

  <span class="toolbar__spacer" aria-hidden="true"></span>

  <div class="toolbar__group toolbar__group--segmented" aria-label="Workspace actions">
    {#if sourceSnippet}
      <button
        type="button"
        class:active={didCopySource}
        aria-label={didCopySource ? 'Copied source snippet' : 'Copy source snippet'}
        title={didCopySource ? 'Copied source snippet' : 'Copy source snippet'}
        onclick={copyStorySource}
      >
        {#if didCopySource}
          <Check size={16} aria-hidden="true" />
        {:else}
          <Copy size={16} aria-hidden="true" />
        {/if}
      </button>
    {/if}

    <button
      type="button"
      class:active={storyliteSettings.maximized}
      aria-label={storyliteSettings.maximized ? 'Shrink workspace' : 'Expand workspace'}
      title={storyliteSettings.maximized ? 'Shrink workspace' : 'Expand workspace'}
      onclick={() => (storyliteSettings.maximized = !storyliteSettings.maximized)}
    >
      {#if storyliteSettings.maximized}
        <Shrink size={16} aria-hidden="true" />
      {:else}
        <Expand size={16} aria-hidden="true" />
      {/if}
    </button>

    {#if activeStory}
      <a
        href={canvasUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Open canvas in a new tab"
        title="Open canvas in a new tab"
      >
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    {/if}
  </div>
</header>
