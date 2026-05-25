export type ReactFieldProps = {
  readonly label: string
  readonly placeholder: string
}

export function ReactField({ label, placeholder }: ReactFieldProps) {
  return (
    <label className="grid max-w-[420px] gap-[7px] rounded-[var(--react-radius)] border border-[color:var(--react-border)] bg-[color:var(--react-surface)] p-4">
      <span className="text-[color:var(--react-muted)]">{label}</span>
      <input
        className="min-h-10 rounded-lg border border-[color:var(--react-border)] bg-[color:Canvas] px-3 text-[color:CanvasText]"
        aria-label={label}
        placeholder={placeholder}
      />
    </label>
  )
}
