import { Check } from "lucide-react"
import { cn } from "@/utils/cn"

interface CheckButtonProps {
  checked: boolean
  /** Names the task this ticks, e.g. Mark "Read 20 pages" as complete */
  label: string
  onToggle: () => void
  className?: string
}

/** A compact 26px tick inside a 44px tap area. A button with the checkbox role: state is announced, Space toggles it. */
export function CheckButton({ checked, label, onToggle, className }: CheckButtonProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      data-done={checked}
      onClick={onToggle}
      className={cn("group relative z-10 grid size-11 shrink-0 place-items-center rounded-full", className)}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-[1.625rem] place-items-center rounded-full border-2 transition-colors duration-150",
          checked ? "border-check bg-check text-on-check" : "border-muted text-transparent group-hover:border-text",
        )}
      >
        <Check strokeWidth={3.5} className="check-icon size-4" />
      </span>
    </button>
  )
}
