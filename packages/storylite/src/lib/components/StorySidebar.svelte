<script lang="ts">
  import Accessibility from '@lucide/svelte/icons/accessibility'
  import Bug from '@lucide/svelte/icons/bug'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import Eye from '@lucide/svelte/icons/eye'
  import Flag from '@lucide/svelte/icons/flag'
  import Globe from '@lucide/svelte/icons/globe'
  import Info from '@lucide/svelte/icons/info'
  import Layout from '@lucide/svelte/icons/layout'
  import Menu from '@lucide/svelte/icons/menu'
  import Monitor from '@lucide/svelte/icons/monitor'
  import Moon from '@lucide/svelte/icons/moon'
  import PaintBucket from '@lucide/svelte/icons/paint-bucket'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import Search from '@lucide/svelte/icons/search'
  import Settings from '@lucide/svelte/icons/settings'
  import Sun from '@lucide/svelte/icons/sun'
  import Zap from '@lucide/svelte/icons/zap'
  import type { StoryLiteIconName } from '../../public'
  import type { StoryLiteProjectUi } from 'virtual:storylite/project'
  import { storyliteSettings } from '../storylite/settings.svelte'
  import type { StoryGroup, StoryLiteStory } from '../storylite/types'

  type Props = {
    readonly projectUi: StoryLiteProjectUi
    readonly stories: readonly StoryLiteStory[]
    readonly groups: readonly StoryGroup[]
    readonly activeStoryId: string | undefined
    readonly storyHref: (story: StoryLiteStory) => string
    readonly onSelectStory: (story: StoryLiteStory) => void
    searchQuery: string
  }

  let {
    projectUi,
    stories,
    groups,
    activeStoryId,
    storyHref,
    onSelectStory,
    searchQuery = $bindable(),
  }: Props = $props()

  let searchInput: HTMLInputElement | undefined = $state()
  let collapsedGroups: Record<string, boolean> = $state({})

  const hasSearchQuery = $derived(searchQuery.trim().length > 0)
  const brandSubtitle = $derived(projectUi.brand.subtitle ?? `${stories.length} stories`)

  function isGroupExpanded(title: string): boolean {
    return hasSearchQuery || !collapsedGroups[title]
  }

  function toggleGroup(title: string): void {
    collapsedGroups = {
      ...collapsedGroups,
      [title]: isGroupExpanded(title),
    }
  }

  function groupDomId(title: string): string {
    return `story-group-${title.replace(/[^a-zA-Z0-9_-]+/g, '-')}`
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== '/' || isEditable(event.target)) {
      return
    }

    event.preventDefault()
    searchInput?.focus()
    searchInput?.select()
  }

  function isEditable(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    )
  }

  function handleStoryClick(event: MouseEvent, story: StoryLiteStory): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    onSelectStory(story)
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet menuIcon(icon: StoryLiteIconName | undefined)}
  {#if icon === 'accessibility'}
    <Accessibility size={15} aria-hidden="true" />
  {:else if icon === 'bug'}
    <Bug size={15} aria-hidden="true" />
  {:else if icon === 'external-link'}
    <ExternalLink size={15} aria-hidden="true" />
  {:else if icon === 'eye'}
    <Eye size={15} aria-hidden="true" />
  {:else if icon === 'flag'}
    <Flag size={15} aria-hidden="true" />
  {:else if icon === 'globe'}
    <Globe size={15} aria-hidden="true" />
  {:else if icon === 'info'}
    <Info size={15} aria-hidden="true" />
  {:else if icon === 'layout'}
    <Layout size={15} aria-hidden="true" />
  {:else if icon === 'monitor'}
    <Monitor size={15} aria-hidden="true" />
  {:else if icon === 'moon'}
    <Moon size={15} aria-hidden="true" />
  {:else if icon === 'paint-bucket'}
    <PaintBucket size={15} aria-hidden="true" />
  {:else if icon === 'settings'}
    <Settings size={15} aria-hidden="true" />
  {:else if icon === 'sun'}
    <Sun size={15} aria-hidden="true" />
  {:else if icon === 'zap'}
    <Zap size={15} aria-hidden="true" />
  {:else}
    <ExternalLink size={15} aria-hidden="true" />
  {/if}
{/snippet}

<aside class="sidebar" aria-label="Stories">
  <header class="brand">
    <div class="brand__mark" aria-hidden="true">{@html projectUi.brand.markHtml}</div>
    <div class="brand__content">
      <a class="brand__title" href="#/" aria-label="Open StoryLite home">
        {@html projectUi.brand.titleHtml}
      </a>
      <span>{brandSubtitle}</span>
    </div>
    <button
      type="button"
      class="brand__menu-button"
      aria-label="Open StoryLite menu"
      title="Menu"
      popovertarget="storylite-app-menu"
    >
      <Menu size={16} aria-hidden="true" />
    </button>
    <div class="app-menu" id="storylite-app-menu" popover="auto">
      {#each projectUi.menuLinks as link (link.id)}
        <a class="app-menu__item" href={link.href} target={link.target} rel={link.rel}>
          {@render menuIcon(link.icon)}
          <span>{link.label}</span>
        </a>
      {/each}

      <div class="app-menu__theme" aria-label="StoryLite theme">
        <button
          type="button"
          class:active={storyliteSettings.appTheme === 'system'}
          aria-label="Use system StoryLite theme"
          title="System"
          onclick={() => (storyliteSettings.appTheme = 'system')}
        >
          <Monitor size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          class:active={storyliteSettings.appTheme === 'light'}
          aria-label="Use light StoryLite theme"
          title="Light"
          onclick={() => (storyliteSettings.appTheme = 'light')}
        >
          <Sun size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          class:active={storyliteSettings.appTheme === 'dark'}
          aria-label="Use dark StoryLite theme"
          title="Dark"
          onclick={() => (storyliteSettings.appTheme = 'dark')}
        >
          <Moon size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>

  <div class="sidebar__body">
    <search class="story-search">
      <Search size={14} aria-hidden="true" />
      <input
        bind:this={searchInput}
        bind:value={searchQuery}
        type="search"
        placeholder="Search stories"
        aria-label="Search stories"
      />
    </search>

    <nav class="story-tree">
      {#each groups as group (group.title)}
        {@const expanded = isGroupExpanded(group.title)}
        {@const domId = groupDomId(group.title)}
        <section class="story-group" aria-labelledby={`${domId}-heading`}>
          <h2 id={`${domId}-heading`}>
            <button
              type="button"
              class="story-group__toggle"
              aria-expanded={expanded}
              aria-controls={`${domId}-stories`}
              onclick={() => toggleGroup(group.title)}
            >
              {#if expanded}
                <ChevronDown size={14} aria-hidden="true" />
              {:else}
                <ChevronRight size={14} aria-hidden="true" />
              {/if}
              <span>{group.title}</span>
              <small>{group.stories.length}</small>
            </button>
          </h2>
          {#if expanded}
            <div class="story-group__stories" id={`${domId}-stories`}>
              {#each group.stories as story (`${story.importPath}:${story.exportName}`)}
                <a
                  href={storyHref(story)}
                  class="story-group__link"
                  class:active={story.id === activeStoryId}
                  onclick={(event) => handleStoryClick(event, story)}
                >
                  <span>{story.name}</span>
                </a>
              {/each}
            </div>
          {/if}
        </section>
      {:else}
        <p class="empty story-tree__empty">No stories match.</p>
      {/each}
    </nav>
  </div>
</aside>
