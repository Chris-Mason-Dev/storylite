<script lang="ts">
  import Accessibility from '@lucide/svelte/icons/accessibility'
  import Bug from '@lucide/svelte/icons/bug'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import ComponentIcon from '@lucide/svelte/icons/component'
  import Diamond from '@lucide/svelte/icons/diamond'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import Eye from '@lucide/svelte/icons/eye'
  import Flag from '@lucide/svelte/icons/flag'
  import Folder from '@lucide/svelte/icons/folder'
  import Globe from '@lucide/svelte/icons/globe'
  import Home from '@lucide/svelte/icons/home'
  import Info from '@lucide/svelte/icons/info'
  import Layout from '@lucide/svelte/icons/layout'
  import Menu from '@lucide/svelte/icons/menu'
  import Monitor from '@lucide/svelte/icons/monitor'
  import Moon from '@lucide/svelte/icons/moon'
  import PaintBucket from '@lucide/svelte/icons/paint-bucket'
  import Search from '@lucide/svelte/icons/search'
  import Settings from '@lucide/svelte/icons/settings'
  import Sun from '@lucide/svelte/icons/sun'
  import Zap from '@lucide/svelte/icons/zap'
  import type { StoryLiteProjectUi } from 'virtual:storylite/project'
  import type { StoryLiteIconName } from '../../public'
  import { storyliteSettings } from '../storylite/settings.svelte'
  import type {
    StoryComponentGroup,
    StoryGroup,
    StoryLiteStory,
    StoryTreeItem,
  } from '../storylite/types'

  const HOME_LINK_ENABLED = false

  type Props = {
    readonly projectUi: StoryLiteProjectUi
    readonly stories: readonly StoryLiteStory[]
    readonly groups: readonly StoryTreeItem[]
    readonly activeStoryId: string | undefined
    readonly hasHome: boolean
    readonly isHomeActive: boolean
    readonly storyHref: (story: StoryLiteStory) => string
    readonly onSelectStory: (story: StoryLiteStory) => void
    searchQuery: string
  }

  let {
    projectUi,
    stories,
    groups,
    activeStoryId,
    hasHome,
    isHomeActive,
    storyHref,
    onSelectStory,
    searchQuery = $bindable(),
  }: Props = $props()

  let searchInput: HTMLInputElement | undefined = $state()
  let collapsedGroups: Partial<Record<string, boolean>> = $state({})
  let collapsedComponents: Partial<Record<string, boolean>> = $state({})

  const hasSearchQuery = $derived(searchQuery.trim().length > 0)
  const brandSubtitle = $derived(projectUi.brand.subtitle ?? `${stories.length} stories`)
  const firstTreeItemKey = $derived(groups[0] ? treeItemKey(groups[0]) : '')
  const firstComponentKey = $derived(firstComponentKeyFor(groups[0]))

  function isGroupExpanded(group: StoryGroup): boolean {
    const key = treeItemKey(group)
    const isCollapsed = collapsedGroups[key]

    if (hasSearchQuery) {
      return true
    }

    if (isCollapsed !== undefined) {
      return !isCollapsed
    }

    return groupContainsActiveStory(group) || !isGroupCollapsedByDefault(key)
  }

  function toggleGroup(group: StoryGroup): void {
    const key = treeItemKey(group)

    collapsedGroups = {
      ...collapsedGroups,
      [key]: isGroupExpanded(group),
    }
  }

  function isComponentExpanded(
    groupTitle: string | undefined,
    component: StoryComponentGroup,
  ): boolean {
    const key = componentKey(groupTitle, component.title)
    const isCollapsed = collapsedComponents[key]

    if (hasSearchQuery) {
      return true
    }

    if (isCollapsed !== undefined) {
      return !isCollapsed
    }

    return componentContainsActiveStory(component) || !isComponentCollapsedByDefault(key)
  }

  function toggleComponent(groupTitle: string | undefined, component: StoryComponentGroup): void {
    collapsedComponents = {
      ...collapsedComponents,
      [componentKey(groupTitle, component.title)]: isComponentExpanded(groupTitle, component),
    }
  }

  function componentKey(groupTitle: string | undefined, componentTitle: string): string {
    return groupTitle ? `${groupTitle}/${componentTitle}` : componentTitle
  }

  function treeItemKey(item: StoryTreeItem): string {
    return item.kind === 'group' ? `group:${item.title}` : `component:${item.title}`
  }

  function firstComponentKeyFor(item: StoryTreeItem | undefined): string {
    if (!item) {
      return ''
    }

    if (item.kind === 'component') {
      return componentKey(undefined, item.title)
    }

    const component = item.components[0]
    return component ? componentKey(item.title, component.title) : ''
  }

  function isGroupCollapsedByDefault(key: string): boolean {
    return hasHome || key !== firstTreeItemKey
  }

  function isComponentCollapsedByDefault(key: string): boolean {
    return hasHome || key !== firstComponentKey
  }

  function groupContainsActiveStory(group: StoryGroup): boolean {
    return group.components.some(componentContainsActiveStory)
  }

  function componentContainsActiveStory(component: StoryComponentGroup): boolean {
    return Boolean(activeStoryId && component.stories.some((story) => story.id === activeStoryId))
  }

  function groupDomId(title: string): string {
    return `story-group-${title.replace(/[^a-zA-Z0-9_-]+/g, '-')}`
  }

  function componentDomId(groupTitle: string | undefined, componentTitle: string): string {
    return `story-component-${componentKey(groupTitle, componentTitle).replace(/[^a-zA-Z0-9_-]+/g, '-')}`
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

{#snippet componentNode(component: StoryComponentGroup, groupTitle: string | undefined)}
  {@const componentExpanded = isComponentExpanded(groupTitle, component)}
  {@const componentId = componentDomId(groupTitle, component.title)}
  <section class="story-component" aria-labelledby={`${componentId}-heading`}>
    <h3 id={`${componentId}-heading`}>
      <button
        type="button"
        class="story-component__toggle"
        aria-expanded={componentExpanded}
        aria-controls={`${componentId}-stories`}
        onclick={() => toggleComponent(groupTitle, component)}
      >
        {#if componentExpanded}
          <ChevronDown class="story-tree__chevron" size={14} aria-hidden="true" />
        {:else}
          <ChevronRight class="story-tree__chevron" size={14} aria-hidden="true" />
        {/if}
        <ComponentIcon class="story-tree__type-icon" size={14} aria-hidden="true" />
        <span>{component.title}</span>
        <small>{component.storyCount}</small>
      </button>
    </h3>
    <div
      class="story-component__stories story-tree__branch"
      class:story-tree__branch--collapsed={!componentExpanded}
      id={`${componentId}-stories`}
    >
      {#each component.stories as story (`${story.importPath}:${story.exportName}`)}
        <a
          href={storyHref(story)}
          class="story-link"
          class:active={story.id === activeStoryId}
          onclick={(event) => handleStoryClick(event, story)}
        >
          <Diamond class="story-link__icon" size={10} aria-hidden="true" />
          <span>{story.name}</span>
        </a>
      {/each}
    </div>
  </section>
{/snippet}

<noscript>
  <style>
    .story-tree__branch--collapsed {
      display: grid !important;
    }
  </style>
</noscript>

<aside class="sidebar" aria-label="Stories">
  <header class="brand">
    <a href="#/" aria-label="Open home" class="brand__mark" aria-hidden="true"
      >{@html projectUi.brand.markHtml}</a
    >
    <div class="brand__content">
      <a class="brand__title" href="#/" aria-label="Open home">
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
      {#if hasHome && HOME_LINK_ENABLED}
        <a class="story-link story-tree__home" class:active={isHomeActive} href="#/">
          <Home class="story-link__icon" size={13} aria-hidden="true" />
          <span>Home</span>
        </a>
      {/if}

      {#each groups as item (treeItemKey(item))}
        {#if item.kind === 'group'}
          {@const expanded = isGroupExpanded(item)}
          {@const domId = groupDomId(item.title)}
          <section class="story-group" aria-labelledby={`${domId}-heading`}>
            <h2 id={`${domId}-heading`}>
              <button
                type="button"
                class="story-group__toggle"
                aria-expanded={expanded}
                aria-controls={`${domId}-components`}
                onclick={() => toggleGroup(item)}
              >
                {#if expanded}
                  <ChevronDown class="story-tree__chevron" size={14} aria-hidden="true" />
                {:else}
                  <ChevronRight class="story-tree__chevron" size={14} aria-hidden="true" />
                {/if}
                <Folder class="story-tree__type-icon" size={14} aria-hidden="true" />
                <span>{item.title}</span>
                <small>{item.storyCount}</small>
              </button>
            </h2>
            <div
              class="story-group__components story-tree__branch"
              class:story-tree__branch--collapsed={!expanded}
              id={`${domId}-components`}
            >
              {#each item.components as component (componentKey(item.title, component.title))}
                {@render componentNode(component, item.title)}
              {/each}
            </div>
          </section>
        {:else}
          {@render componentNode(item, undefined)}
        {/if}
      {:else}
        <p class="empty story-tree__empty">No stories match.</p>
      {/each}
    </nav>
  </div>
</aside>
