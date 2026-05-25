type Props = {
  readonly eyebrow: string
  readonly title: string
  readonly body: string
}

export function SolidCard(props: Props) {
  return (
    <article class="max-w-[380px] rounded-[var(--solid-radius)] border border-[color:var(--solid-border)] bg-[color:var(--solid-surface)] p-[18px]">
      <p class="text-[color:var(--solid-muted)]">{props.eyebrow}</p>
      <h2>{props.title}</h2>
      <p class="text-[color:var(--solid-muted)]">{props.body}</p>
    </article>
  )
}
