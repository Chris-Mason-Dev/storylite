export type PreactFieldProps = {
  readonly label: string
  readonly placeholder: string
}

export function PreactField({ label, placeholder }: PreactFieldProps) {
  return (
    <label className="grid max-w-[420px] gap-[7px] rounded-[var(--preact-radius)] border border-[color:var(--preact-border)] bg-[color:var(--preact-surface)] p-4 shadow-sm">
      <span className="text-[color:var(--preact-muted)]">{label}</span>
      <input
        className="min-h-10 rounded-lg border border-[color:var(--preact-border)] bg-[color:Canvas] px-3 text-[color:CanvasText]"
        aria-label={label}
        placeholder={placeholder}
      />
    </label>
  )
}
