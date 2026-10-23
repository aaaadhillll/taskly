import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { useTasks } from "@/hooks/useTasks"
import { useUi } from "@/hooks/useUi"
import { addMonths, formatDate, startOfMonth, todayKey } from "@/utils/date"
import { sortTasks } from "@/utils/tasks"
import { MonthGrid } from "@/components/calendar/MonthGrid"
import { TaskList } from "@/components/tasks/TaskList"
import { Button, IconButton } from "@/components/ui/Button"

export function CalendarPage() {
  const { tasks } = useTasks()
  const { selectedDate, setSelectedDate, openForm } = useUi()
  const today = todayKey()
  const [month, setMonth] = useState(() => startOfMonth(selectedDate))

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of tasks) map.set(t.dueDate, (map.get(t.dueDate) ?? 0) + 1)
    return map
  }, [tasks])

  const dayTasks = sortTasks(tasks.filter((t) => t.dueDate === selectedDate), "smart", "today")

  return (
    <div className="animate-rise flex flex-1 flex-col xl:grid xl:grid-cols-12 xl:gap-x-12">
      <div className="xl:col-span-7">
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h1 className="text-page">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMonth(startOfMonth(today))
                setSelectedDate(today)
              }}
            >
              Today
            </Button>
            <IconButton label="New task on this day" onClick={() => openForm({ dueDate: selectedDate })} className="size-11 rounded-xl bg-accent text-accent-ink ring-0 hover:bg-accent hover:brightness-105">
              <Plus aria-hidden className="size-5" strokeWidth={2.75} />
            </IconButton>
          </div>
        </header>

        <div className="mt-4 md:mt-8 md:rounded-4xl md:bg-surface md:p-8">
          <div className="flex items-center justify-between gap-2">
            <IconButton label="Previous month" onClick={() => setMonth(addMonths(month, -1))} className="size-[44px] bg-transparent ring-0 hover:bg-text/10">
              <ChevronLeft aria-hidden className="size-5" />
            </IconButton>
            <h2 aria-live="polite" className="min-w-0 text-center text-base font-bold md:text-h1">
              {formatDate(month, { month: "long", year: "numeric" })}
            </h2>
            <IconButton label="Next month" onClick={() => setMonth(addMonths(month, 1))} className="size-[44px] bg-transparent ring-0 hover:bg-text/10">
              <ChevronRight aria-hidden className="size-5" />
            </IconButton>
          </div>
          <div className="mt-2 md:mt-6">
            <MonthGrid month={month} selected={selectedDate} today={today} counts={counts} onSelect={setSelectedDate} />
          </div>
        </div>
      </div>

      <section aria-labelledby="day-title" className="mt-5 flex flex-1 flex-col rounded-3xl bg-surface p-4 md:mt-6 md:rounded-4xl md:p-8 xl:col-span-5 xl:mt-0 xl:self-start">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="day-title" className="text-base font-extrabold md:text-xl">
            {formatDate(selectedDate, { weekday: "short", month: "short", day: "numeric" })}
          </h2>
          <p className="text-sm font-semibold text-muted">
            {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>
        <div className="mt-1 flex flex-1 flex-col">
          <TaskList
            tasks={dayTasks}
            today={today}
            day={selectedDate}
            variant="plain"
            menu={false}
            empty={{
              title: "Nothing planned",
              message: "This day is clear.",
              action: (
                <Button variant="solid" size="md" onClick={() => openForm({ dueDate: selectedDate })}>
                  New task
                </Button>
              ),
            }}
          />
        </div>
      </section>
    </div>
  )
}
