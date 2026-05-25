export type ReactLayoutProps = {
  readonly first: string
  readonly second: string
  readonly third: string
}

export function ReactLayout({ first, second, third }: ReactLayoutProps) {
  const itemClassName = 'grid gap-1.5 rounded-[10px] bg-[color:var(--react-accent-soft)] p-3.5'

  return (
    <section
      className="grid gap-3 rounded-[var(--react-radius)] border border-[color:var(--react-border)] bg-[color:var(--react-surface)] p-4 md:grid-cols-3"
      aria-label="React layout sample"
    >
      <article className={itemClassName}>
        <h3 className="m-0">{first}</h3>
        <p className="m-0 text-[color:var(--react-muted)]">
          Story modules normalize into one renderer-neutral shape.
        </p>
      </article>
      <article className={itemClassName}>
        <h3 className="m-0">{second}</h3>
        <p className="m-0 text-[color:var(--react-muted)]">
          React mounts into the same isolated iframe canvas.
        </p>
      </article>
      <article className={itemClassName}>
        <h3 className="m-0">{third}</h3>
        <p className="m-0 text-[color:var(--react-muted)]">
          Unmount cleanup runs when switching stories.
        </p>
      </article>
    </section>
  )
}
