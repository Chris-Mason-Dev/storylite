export type ReactCardProps = {
  readonly eyebrow: string
  readonly title: string
  readonly body: string
}

export function ReactCard({ eyebrow, title, body }: ReactCardProps) {
  return (
    <article className="grid max-w-[520px] gap-3 rounded-[var(--react-radius)] border border-[color:var(--react-border)] bg-[color:var(--react-surface)] p-4">
      <p className="m-0 text-[color:var(--react-muted)]">{eyebrow}</p>
      <h2 className="m-0">{title}</h2>
      <p className="m-0">{body}</p>
    </article>
  )
}
