<script lang="ts">
  import RefreshCw from '@lucide/svelte/icons/refresh-cw'
  import { inferControlType } from '../storylite/normalize'
  import type { StoryArgType, StoryArgs, StoryLiteStory } from '../storylite/types'

  type Props = {
    readonly activeStory: StoryLiteStory | undefined
    readonly activeArgs: StoryArgs
    readonly onResetArgs: () => void
    readonly onUpdateArg: (name: string, value: unknown) => void
  }

  let { activeStory, activeArgs, onResetArgs, onUpdateArg }: Props = $props()

  const activeArgNames = $derived(
    activeStory ? Object.keys({ ...activeStory.argTypes, ...activeStory.args }).sort() : [],
  )

  function controlType(name: string): string {
    return inferControlType(activeStory?.argTypes[name], activeArgs[name])
  }

  function argType(name: string): StoryArgType | undefined {
    return activeStory?.argTypes[name]
  }
</script>

<aside class="inspector" aria-label="Story controls">
  <header class="inspector__header">
    <div>
      <span>Controls</span>
      <strong>{activeStory?.name ?? 'No story'}</strong>
    </div>
    <button type="button" aria-label="Reset controls" title="Reset controls" onclick={onResetArgs}>
      <RefreshCw size={16} aria-hidden="true" />
    </button>
  </header>

  <div class="inspector__body">
    {#if activeStory}
      <dl class="story-meta">
        <div>
          <dt>Group</dt>
          <dd>{activeStory.title}</dd>
        </div>
        <div>
          <dt>Renderer</dt>
          <dd>{activeStory.renderer}</dd>
        </div>
      </dl>
    {/if}

    <form class="controls">
      {#each activeArgNames as name (name)}
        {@const type = controlType(name)}
        {@const metadata = argType(name)}
        <label class="control" class:control--boolean={type === 'boolean'}>
          {#if type === 'boolean'}
            <input
              type="checkbox"
              checked={Boolean(activeArgs[name])}
              onchange={(event) => onUpdateArg(name, event.currentTarget.checked)}
            />
            <span>{name}</span>
          {:else if type === 'textarea'}
            <span>{name}</span>
            <textarea
              rows="4"
              value={String(activeArgs[name] ?? '')}
              oninput={(event) => onUpdateArg(name, event.currentTarget.value)}
            ></textarea>
          {:else if type === 'number'}
            <span>{name}</span>
            <input
              type="number"
              value={Number(activeArgs[name] ?? 0)}
              oninput={(event) => onUpdateArg(name, event.currentTarget.valueAsNumber)}
            />
          {:else if type === 'color'}
            <span>{name}</span>
            <input
              type="color"
              value={String(activeArgs[name] ?? '#000000')}
              oninput={(event) => onUpdateArg(name, event.currentTarget.value)}
            />
          {:else if type === 'select' && metadata?.options}
            <span>{name}</span>
            <select
              value={String(activeArgs[name] ?? '')}
              onchange={(event) => onUpdateArg(name, event.currentTarget.value)}
            >
              {#each metadata.options as option (String(option))}
                <option value={String(option)}>{String(option)}</option>
              {/each}
            </select>
          {:else}
            <span>{name}</span>
            <input
              type="text"
              value={String(activeArgs[name] ?? '')}
              oninput={(event) => onUpdateArg(name, event.currentTarget.value)}
            />
          {/if}
        </label>
      {:else}
        <p class="empty">This story has no controls.</p>
      {/each}
    </form>
  </div>
</aside>
