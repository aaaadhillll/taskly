import { cn } from "@/utils/cn"
import { addDays, daysInMonth, formatDate, parseKey, startOfWeek } from "@/utils/date"

interface MonthGridProps {
  /** First day of the month being shown */
  month: string
  selected: string
  today: string
  /** Tasks due per day */
  counts: Map<string, number>
  onSelect: (day: string) => void
}

/** A month of day buttons, Monday first. The selected day is a lime circle; dots show how many tasks a day holds (up to three). */
export function MonthGrid({ month, selected, today, counts, onSelect }: MonthGridProps) {
  const lead = (parseKey(month).getDay() + 6) % 7
  const weekdays = Array.from({ length: 7 }, (_, i) => formatDate(addDays(startOfWeek(today), i), { weekday: "short" }))

  return (
    <div className="grid grid-cols-7 gap-y-1 md:gap-2">
      {weekdays.map((w) => (
        <span key={w} aria-hidden className="pb-2 text-center text-xs font-medium text-muted md:font-extrabold md:uppercase md:tracking-[0.1em]">
          {w}
        </span>
      ))}
      {Array.from({ length: lead }, (_, i) => (
        <span key={`gap-${i}`} />
      ))}
      {Array.from({ length: daysInMonth(month) }, (_, i) => {
        const day = addDays(month, i)
        const count = counts.get(day) ?? 0
        const isSelected = day === selected
        return (
          <button
            key={day}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${formatDate(day, { weekday: "long", month: "long", day: "numeric" })}${count ? `, ${count} ${count === 1 ? "task" : "tasks"}` : ""}`}
            onClick={() => onSelect(day)}
            className={cn(
              "relative mx-auto grid h-11 w-full max-w-11 place-items-center rounded-full text-[15px] font-semibold transition-colors duration-150 md:h-14 md:w-full md:rounded-2xl md:text-xl md:font-bold xl:aspect-square xl:h-auto",
              isSelected ? "bg-accent text-accent-ink" : "text-text hover:bg-text/10",
              !isSelected && day === today && "ring-2 ring-inset ring-text/35",
            )}
          >
            {i + 1}
            {count > 0 && (
              <span aria-hidden className="absolute bottom-0.5 flex gap-0.5 md:bottom-1.5">
                {Array.from({ length: Math.min(count, 3) }, (_, dot) => (
                  <span key={dot} className="size-1 rounded-full bg-current opacity-70" />
                ))}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
