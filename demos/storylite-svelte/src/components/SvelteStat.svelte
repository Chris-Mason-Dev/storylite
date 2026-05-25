<script lang="ts">
  type Props = {
    readonly label: string
    readonly value: string
  }

  let { label, value }: Props = $props()
</script>

<section
  class="max-w-[360px] rounded-[var(--svelte-radius)] border border-[color:var(--svelte-border)] bg-[color:var(--svelte-surface)] p-[18px]"
  aria-label={label}
>
  <span class="text-[color:var(--svelte-muted)]">{label}</span>
  <strong>{value}</strong>
</section>
