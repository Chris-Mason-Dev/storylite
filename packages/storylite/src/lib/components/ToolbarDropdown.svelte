<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    readonly label: string
    readonly title?: string
    readonly panelLabel?: string
    readonly active?: boolean
    readonly trigger: Snippet
    readonly children: Snippet<[string]>
  }

  const uid = $props.id()

  let {
    label,
    title = label,
    panelLabel = label,
    active = false,
    trigger,
    children,
  }: Props = $props()
  const popoverId = `${uid}-popover`
</script>

<button
  type="button"
  class="toolbar__icon-button toolbar-dropdown__trigger"
  popovertarget={popoverId}
  aria-label={label}
  {title}
  class:active
>
  {@render trigger()}
</button>

<div class="toolbar-dropdown__panel" id={popoverId} popover="auto" aria-label={panelLabel}>
  {@render children(popoverId)}
</div>
