import { cn } from "@/utils/cn"

interface ProgressBarProps {
  /** 0 to 100 */
  value: number
  label: string
  /** "ink" reads on a lime card; "accent" is lime on a dark or light track */
  tone?: "ink" | "accent"
  className?: string
}

export function ProgressBar({ value, label, tone = "accent", className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cn("h-4 overflow-hidden rounded-full", tone === "ink" ? "bg-accent-ink/15" : "bg-text/15", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", tone === "ink" ? "bg-accent-ink" : "bg-accent")}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
