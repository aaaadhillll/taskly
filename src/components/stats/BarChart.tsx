import { cn } from "@/utils/cn"
import type { Bar } from "@/utils/tasks"

/**
 * Completed tasks per day / week / month. The current period is lime; each bar is labelled for
 * screen readers. On a phone the numbers above the bars are dropped and the chart is short, so it
 * can sit beside the completion rate.
 */
export function BarChart({ bars, className }: { bars: Bar[]; className?: string }) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  return (
    <ol className={cn("flex h-32 items-stretch gap-1 md:h-64 md:gap-3", className)}>
      {bars.map((bar) => (
        <li key={bar.name} aria-label={`${bar.name}: ${bar.value} completed`} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 md:gap-2">
          <span aria-hidden className="hidden text-sm font-bold tabular-nums text-muted md:block">
            {bar.value}
          </span>
          <div aria-hidden className="flex w-full flex-1 items-end justify-center">
            <div
              className={cn("w-full max-w-11 rounded-t-lg rounded-b-sm transition-[height] duration-500 ease-out md:rounded-t-xl md:rounded-b-md", bar.current ? "bg-accent" : "bg-bar")}
              style={{ height: `${Math.max((bar.value / max) * 100, 4)}%` }}
            />
          </div>
          <span aria-hidden className="text-[11px] font-bold uppercase text-muted md:text-xs">
            {bar.compact ? (
              <>
                <span className="md:hidden">{bar.compact}</span>
                <span className="hidden md:inline">{bar.label}</span>
              </>
            ) : (
              <>
                <span className="md:hidden">{bar.label.slice(0, 1)}</span>
                <span className="hidden md:inline">{bar.label}</span>
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}
