<script lang="ts">
  type Props = {
    readonly label: string
    readonly variant: 'primary' | 'secondary'
    readonly disabled: boolean
  }

  let { label, variant, disabled }: Props = $props()
</script>

<button
  class={[
    'min-h-10 rounded-[var(--svelte-radius)] border border-transparent bg-[color:var(--svelte-accent)] px-4 font-bold text-white',
    variant === 'secondary' &&
      'border-[color:var(--svelte-border)] bg-[color:var(--svelte-surface)] text-inherit',
  ]}
  {disabled}
  type="button"
>
  {label}
</button>
