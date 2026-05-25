export type PreactCardProps = {
  readonly eyebrow: string
  readonly title: string
  readonly body: string
}

export function PreactCard({ eyebrow, title, body }: PreactCardProps) {
  return (
    <article className="grid max-w-[520px] gap-3 rounded-[var(--preact-radius)] border border-[color:var(--preact-border)] bg-[color:var(--preact-surface)] p-4 shadow-sm">
      <p className="m-0 text-[color:var(--preact-muted)]">{eyebrow}</p>
      <h2 className="m-0 text-2xl font-extrabold">{title}</h2>
      <p className="m-0 leading-7">{body}</p>
    </article>
  )
}
