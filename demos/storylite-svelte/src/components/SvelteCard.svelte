<script lang="ts">
  type Props = {
    readonly eyebrow: string
    readonly title: string
    readonly body: string
  }

  let { eyebrow, title, body }: Props = $props()
</script>

<article
  class="max-w-[360px] rounded-[var(--svelte-radius)] border border-[color:var(--svelte-border)] bg-[color:var(--svelte-surface)] p-[18px]"
>
  <p class="text-[color:var(--svelte-muted)]">{eyebrow}</p>
  <h2>{title}</h2>
  <p class="text-[color:var(--svelte-muted)]">{body}</p>
</article>
