type Props = {
  readonly label: string
  readonly disabled: boolean
}

export function SolidButton(props: Props) {
  return (
    <button
      class="min-h-10 rounded-[var(--solid-radius)] border border-transparent bg-[color:var(--solid-accent)] px-4 font-bold text-white"
      disabled={props.disabled}
      type="button"
    >
      {props.label}
    </button>
  )
}
