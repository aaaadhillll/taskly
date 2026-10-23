import { ArrowDown, ArrowUp, Check, Flame } from "lucide-react"
import { useState } from "react"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { useTasks } from "@/hooks/useTasks"
import type { StatsRange } from "@/types/task"
import { cn } from "@/utils/cn"
import { todayKey } from "@/utils/date"
import { previousAnchor, statsFor, streakOf } from "@/utils/tasks"
import { BarChart } from "@/components/stats/BarChart"
import { SegmentedTabs } from "@/components/ui/SegmentedTabs"

const RANGES: { value: StatsRange; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
]
const PERIOD: Record<StatsRange, string> = { week: "this week", month: "this month", year: "this year" }
const BEFORE: Record<StatsRange, string> = { week: "last week", month: "last month", year: "last year" }
const BIG = "font-extrabold leading-none tracking-[-0.05em] tabular-nums"

export function StatsPage() {
  const { tasks } = useTasks()
  const desktop = useIsDesktop()
  const today = todayKey()
  const [range, setRange] = useState<StatsRange>("week")
  const stats = statsFor(tasks, range, today)
  const before = statsFor(tasks, range, previousAnchor(range, today), today)
  const streak = streakOf(tasks, today)
  // Percentage points against the period before, when both have something to compare
  const delta = stats.due && before.due ? stats.rate - before.rate : 0

  // Wide screens get the editorial modules (a light card, a lime card); phones get two matching dark cards
  const moduleClass = "flex min-w-0 flex-col justify-between gap-4 rounded-3xl p-4 md:gap-8 md:rounded-4xl md:p-8 lg:p-10"

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-page">Your Progress</h1>
          <p className="mt-1 text-sm font-medium text-muted md:mt-3 md:text-[17px]">Small steps, big results.</p>
        </div>
      </div>

      <SegmentedTabs id="range" label="Time range" options={RANGES} value={range} onChange={setRange} className="mt-4 md:mt-8 md:max-w-xl" />

      <div role="tabpanel" id="range-panel" aria-labelledby={`range-tab-${range}`} className="mt-3 grid grid-cols-1 gap-3 md:mt-6 md:gap-4 lg:grid-cols-12 lg:gap-6">
        <section aria-labelledby="rate-title" className="rounded-3xl bg-surface p-4 md:rounded-4xl md:p-8 lg:col-span-7 lg:p-10">
          <div className={cn("flex gap-5 md:block", range === "year" && "max-md:flex-col")}>
            <div className="shrink-0">
              <p className={cn("text-[2.75rem] md:text-[clamp(5rem,3.5rem+6vw,8rem)]", BIG)}>
                {stats.rate}
                <span className="ml-0.5 text-[0.5em] font-bold tracking-tight text-muted">%</span>
              </p>
              <h2 id="rate-title" className="mt-1 text-[13px] font-medium text-muted md:mt-3 md:text-xs md:font-extrabold md:uppercase md:tracking-[0.16em]">
                Completion Rate<span className="sr-only">, {PERIOD[range]}</span>
              </h2>
              {delta !== 0 && (
                <p
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                    delta > 0 ? "bg-accent/22 text-accent-text" : "bg-danger/18 text-danger-text",
                  )}
                >
                  {delta > 0 ? <ArrowUp aria-hidden className="size-3" strokeWidth={3} /> : <ArrowDown aria-hidden className="size-3" strokeWidth={3} />}
                  {Math.abs(delta)}%<span className="sr-only"> {delta > 0 ? "up" : "down"} on {BEFORE[range]}</span>
                </p>
              )}
            </div>
            <div className="min-w-0 flex-1 md:mt-10">
              <BarChart bars={stats.bars} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:col-span-5 lg:grid-cols-1 lg:gap-6">
          <section
            aria-labelledby="completed-title"
            className={cn(moduleClass, "bg-surface")}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="completed-title" className="order-2 min-w-0 text-[13px] font-medium text-muted md:text-xs md:font-extrabold md:uppercase md:tracking-[0.16em]">
                Tasks Completed
              </h2>
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink md:size-10">
                <Check className="size-4 md:size-5" strokeWidth={3.5} />
              </span>
            </div>
            <div>
              <p className={cn("text-[2.25rem] md:text-[clamp(3rem,2rem+4vw,6rem)]", BIG)}>{stats.completed}</p>
              <p className="mt-1 text-[13px] font-semibold text-muted md:mt-2 md:text-[15px]">{PERIOD[range]}</p>
            </div>
          </section>

          <section
            data-surface={desktop ? "accent" : undefined}
            aria-labelledby="streak-title"
            className={cn(moduleClass, desktop ? "bg-accent text-accent-ink" : "bg-surface")}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="streak-title" className="order-2 min-w-0 text-[13px] font-medium text-muted md:text-xs md:font-extrabold md:uppercase md:tracking-[0.16em]">
                Day Streak
              </h2>
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-warning/20 text-warning-text md:size-10 md:bg-accent-ink md:text-accent">
                <Flame className="size-4 md:size-5" strokeWidth={2.5} />
              </span>
            </div>
            <div>
              <p className={cn("text-[2.25rem] md:text-[clamp(3rem,2rem+4vw,6rem)]", BIG)}>{streak}</p>
              <p className="mt-1 text-[13px] font-semibold text-muted md:mt-2 md:text-[15px]">{streak === 1 ? "day in a row" : "days in a row"}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
