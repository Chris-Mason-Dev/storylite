export type PreactStatsProps = {
  readonly first: string
  readonly second: string
  readonly third: string
}

export function PreactStats({ first, second, third }: PreactStatsProps) {
  const items = [
    { label: first, detail: 'Register the adapter once in StoryLite config.' },
    { label: second, detail: 'Render Preact JSX in the isolated preview canvas.' },
    { label: third, detail: 'Prerender default args into static story pages.' },
  ]

  return (
    <section
      className="grid gap-3 rounded-[var(--preact-radius)] border border-[color:var(--preact-border)] bg-[color:var(--preact-surface)] p-4 shadow-sm md:grid-cols-3"
      aria-label="Preact renderer flow"
    >
      {items.map((item) => (
        <article
          className="grid gap-1.5 rounded-[10px] bg-[color:var(--preact-accent-soft)] p-3.5"
          key={item.label}
        >
          <h3 className="m-0">{item.label}</h3>
          <p className="m-0 text-[color:var(--preact-muted)]">{item.detail}</p>
        </article>
      ))}
    </section>
  )
}
