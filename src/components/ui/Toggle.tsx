import { cn } from "@/utils/cn"

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-11 w-[4.5rem] shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40",
        checked ? "bg-accent" : "bg-elevated ring-1 ring-inset ring-edge",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-1.5 top-1.5 size-8 rounded-full transition-transform duration-200",
          checked ? "translate-x-7 bg-accent-ink" : "translate-x-0 bg-muted",
        )}
      />
    </button>
  )
}
