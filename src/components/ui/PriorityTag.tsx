import { Flag } from "lucide-react"
import type { Priority } from "@/types/task"
import { cn } from "@/utils/cn"

const LABEL: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" }

const FILLED: Record<Priority, string> = {
  high: "bg-danger text-accent-ink",
  medium: "bg-warning text-accent-ink",
  // Outlined in whatever text colour surrounds it, so it works on any surface
  low: "border-2 border-current",
}

// Soft chips. On a lime card they need their own solid colour (a tint of red on lime would vanish).
const CHIP: Record<Priority, string> = {
  high: "bg-danger/15 text-danger-text in-data-[surface=accent]:bg-[#ff8f8f] in-data-[surface=accent]:text-[#430a0a]",
  medium: "bg-warning/18 text-warning-text in-data-[surface=accent]:bg-[#ffcf7a] in-data-[surface=accent]:text-[#3d2700]",
  low: "bg-text/10 text-muted in-data-[surface=accent]:bg-accent-ink/12 in-data-[surface=accent]:text-accent-ink",
}

const INLINE: Record<Priority, string> = {
  high: "text-danger-text",
  medium: "text-warning-text",
  low: "text-muted",
}

interface PriorityTagProps {
  priority: Priority
  /** "filled" is a solid label, "chip" a soft pastel one, "inline" a coloured flag and word for metadata rows */
  variant?: "filled" | "chip" | "inline"
  /** Spell it out: "High priority" */
  long?: boolean
  /** Chip only: a dot (default) or a flag before the word */
  icon?: "dot" | "flag"
  /** Inline only: show just the flag until the row is wide (the word stays for screen readers). Needs an @container ancestor. */
  compact?: boolean
  /** Inline only: grey it out, for a finished task */
  muted?: boolean
  className?: string
}

export function PriorityTag({ priority, variant = "filled", long, icon = "dot", compact, muted, className }: PriorityTagProps) {
  const text = `${LABEL[priority]}${long ? " priority" : ""}`

  if (variant === "chip") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold", CHIP[priority], className)}>
        {icon === "flag" ? <Flag aria-hidden className={cn("size-3.5", priority === "high" && "fill-current")} /> : <span aria-hidden className="size-2 rounded-full bg-current" />}
        {text}
      </span>
    )
  }
  if (variant === "filled") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.08em]", FILLED[priority], className)}>
        <Flag aria-hidden className="size-3.5" />
        {text}
      </span>
    )
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-bold", muted ? "text-muted" : INLINE[priority], className)}>
      <Flag aria-hidden className={cn(compact ? "size-5 @md:size-4" : "size-4", priority === "high" && "fill-current")} />
      <span className={cn(compact && "sr-only @md:not-sr-only")}>{text}</span>
    </span>
  )
}
