export type PreactButtonProps = {
  readonly label: string
  readonly tone?: 'mint' | 'ink'
  readonly disabled?: boolean
}

export function PreactButton({ label, tone = 'mint', disabled = false }: PreactButtonProps) {
  const className = [
    'min-h-[42px] rounded-[var(--preact-radius)] border border-transparent bg-[color:var(--preact-accent)] px-4 font-extrabold text-white shadow-sm',
    tone === 'ink' &&
      'border-[color:var(--preact-border)] bg-[color:var(--preact-surface-alt)] text-current',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={className} disabled={disabled} type="button">
      {label}
    </button>
  )
}
