import type { KeyboardEvent } from "react"
import { cn } from "@/utils/cn"

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedTabsProps<T extends string> {
  /** Prefix for element ids; the matching panel needs id `${id}-panel` and aria-labelledby `${id}-tab-${value}` */
  id: string
  label: string
  options: readonly Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  /** "tabs" switches a panel (default); "radio" is a single choice with no panel, e.g. a setting */
  mode?: "tabs" | "radio"
}

/**
 * The large tab switcher: a lime thumb slides under the selected tab. Real tab semantics: one tab
 * in the tab order, arrow keys / Home / End move between them.
 */
export function SegmentedTabs<T extends string>({ id, label, options, value, onChange, className, mode = "tabs" }: SegmentedTabsProps<T>) {
  const tabs = mode === "tabs"
  const index = Math.max(0, options.findIndex((o) => o.value === value))

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + step + options.length) % options.length
    if (!step && event.key !== "Home" && event.key !== "End") return
    event.preventDefault()
    const target = options[next]
    if (!target) return
    onChange(target.value)
    event.currentTarget.querySelectorAll<HTMLElement>("button")[next]?.focus()
  }

  return (
    <div
      role={tabs ? "tablist" : "radiogroup"}
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("relative grid rounded-full bg-surface p-(--pad) [--pad:0.3125rem] md:rounded-[1.75rem] md:[--pad:0.5rem]", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-(--pad) left-(--pad) rounded-full bg-accent transition-transform duration-300 ease-out md:rounded-3xl"
        style={{ width: `calc((100% - 2 * var(--pad)) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role={tabs ? "tab" : "radio"}
            id={`${id}-tab-${option.value}`}
            aria-selected={tabs ? selected : undefined}
            aria-checked={tabs ? undefined : selected}
            aria-controls={tabs ? `${id}-panel` : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 h-11 rounded-full px-2 text-[13px] font-bold transition-colors duration-200 md:h-14 md:rounded-3xl md:font-extrabold md:uppercase md:tracking-[0.08em]",
              selected ? "text-accent-ink" : "text-muted hover:text-text",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
