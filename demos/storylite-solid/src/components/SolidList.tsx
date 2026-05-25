type Props = {
  readonly label: string
  readonly first: string
  readonly second: string
}

export function SolidList(props: Props) {
  return (
    <section
      class="max-w-[380px] rounded-[var(--solid-radius)] border border-[color:var(--solid-border)] bg-[color:var(--solid-surface)] p-[18px]"
      aria-label={props.label}
    >
      <span class="text-[color:var(--solid-muted)]">{props.label}</span>
      <ul class="mb-0 ps-5">
        <li>{props.first}</li>
        <li>{props.second}</li>
      </ul>
    </section>
  )
}
