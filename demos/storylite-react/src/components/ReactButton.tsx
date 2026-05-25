export type ReactButtonProps = {
  readonly label: string
  readonly variant?: 'primary' | 'secondary'
  readonly disabled?: boolean
}

export function ReactButton({ label, variant = 'primary', disabled = false }: ReactButtonProps) {
  const className = [
    'min-h-[42px] rounded-[var(--react-radius)] border border-transparent bg-[color:var(--react-accent)] px-4 font-extrabold text-white',
    variant === 'secondary' &&
      'border-[color:var(--react-border)] bg-[color:var(--react-surface-alt)] text-current',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={className} disabled={disabled} type="button">
      {label}
    </button>
  )
}
