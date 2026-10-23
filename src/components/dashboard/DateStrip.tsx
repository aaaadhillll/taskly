import { useEffect, useMemo, useRef } from "react"
import { cn } from "@/utils/cn"
import { addDays, diffDays, formatDate } from "@/utils/date"

interface DateStripProps {
  selected: string
  today: string
  onSelect: (day: string) => void
  /** Number of tasks due per day, for the dot and the screen-reader label */
  taskCounts: Map<string, number>
}

const DAYS_BEFORE = 7
const DAYS_AFTER = 28
const GAP = 8 // px between tiles (gap-2)

/**
 * A horizontal strip of day tiles: exactly five across on a phone, seven on a tablet, nine to eleven
 * on a desktop. The selected day is a lime tile; the strip lands on a tile boundary, so none is cut.
 */
export function DateStrip({ selected, today, onSelect, taskCounts }: DateStripProps) {
  const box = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  // Centred on today, unless a day outside that window was picked elsewhere (the calendar)
  const anchor = diffDays(selected, today) >= -DAYS_BEFORE && diffDays(selected, today) <= DAYS_AFTER ? today : selected
  const days = useMemo(() => Array.from({ length: DAYS_BEFORE + DAYS_AFTER + 1 }, (_, i) => addDays(anchor, i - DAYS_BEFORE)), [anchor])

  useEffect(() => {
    const el = box.current
    const tile = el?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!el || !tile) return
    // Fractional widths: rounded ones drift by a pixel or two per tile and leave a sliver at the edge
    const area = el.getBoundingClientRect()
    const rect = tile.getBoundingClientRect()
    const step = rect.width + (matchMedia("(min-width: 640px)").matches ? 12 : GAP)
    const tileLeft = rect.left - area.left + el.scrollLeft
    // Centre the selected tile, then round to a whole number of tiles from the start
    const left = Math.max(0, Math.round((tileLeft - (el.clientWidth - rect.width) / 2) / step) * step)
    el.scrollTo({ left, behavior: mounted.current ? "smooth" : "auto" })
    mounted.current = true
  }, [selected, anchor])

  return (
    <div
      ref={box}
      role="group"
      aria-label="Choose a day"
      className="relative flex gap-2 overflow-x-auto py-2 sm:gap-3 sm:py-3"
    >
      {days.map((day) => {
        const isSelected = day === selected
        const count = taskCounts.get(day) ?? 0
        return (
          <button
            key={day}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${formatDate(day, { weekday: "long", month: "long", day: "numeric" })}${count ? `, ${count} ${count === 1 ? "task" : "tasks"}` : ""}`}
            onClick={() => onSelect(day)}
            className={cn(
              "flex h-16 w-[calc((100%-2rem)/5)] min-w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors duration-200",
              "sm:h-28 sm:w-[calc((100%-6*0.75rem)/7)] sm:gap-1 sm:rounded-3xl lg:h-32 lg:w-[calc((100%-8*0.75rem)/9)] xl:w-[calc((100%-10*0.75rem)/11)]",
              isSelected ? "bg-accent text-accent-ink" : "bg-surface text-text hover:bg-elevated",
              !isSelected && day === today && "ring-2 ring-inset ring-accent/60",
            )}
          >
            <span className={cn("text-xs font-semibold sm:font-extrabold sm:uppercase sm:tracking-[0.12em]", !isSelected && "text-muted")}>
              {formatDate(day, { weekday: "short" })}
            </span>
            <span className="text-lg font-bold tracking-tight sm:text-3xl sm:font-extrabold lg:text-4xl">{formatDate(day, { day: "numeric" })}</span>
            <span aria-hidden className={cn("hidden size-1.5 rounded-full sm:block", count ? "bg-current" : "bg-transparent")} />
          </button>
        )
      })}
    </div>
  )
}
