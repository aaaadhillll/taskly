import { categoryInfo } from "@/data/categories"
import { countByCategory, useDashboard } from "@/hooks/useDashboard"
import { formatDate } from "@/utils/date"
import type { StatusTab } from "@/types/task"
import { CategoryTabs } from "@/components/dashboard/CategoryTabs"
import { DateStrip } from "@/components/dashboard/DateStrip"
import { Greeting } from "@/components/dashboard/Greeting"
import { ProgressHero } from "@/components/dashboard/ProgressHero"
import { SearchControls } from "@/components/dashboard/SearchControls"
import { FeaturedTask } from "@/components/tasks/FeaturedTask"
import { TaskList } from "@/components/tasks/TaskList"
import { Button } from "@/components/ui/Button"
import { SegmentedTabs } from "@/components/ui/SegmentedTabs"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

/**
 * The desktop dashboard, an editorial composition: a big greeting with search, a wide day strip, the
 * progress card with the category index on the left, the tabs, next-up card and list on the right.
 */
export function DesktopDashboard() {
  const d = useDashboard()
  const { ui, day, today } = d

  const tabs: { value: StatusTab; label: string }[] = [
    { value: "today", label: day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric" }) },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ]
  const listTitle = d.listTitle ?? (day === today ? "Today" : formatDate(day, { weekday: "long", month: "short", day: "numeric" }))
  const counts = countByCategory(d.inTab)

  const empty = d.searching
    ? { title: "No matches", message: `Nothing matches "${ui.query.trim()}".`, action: <Button variant="secondary" onClick={() => ui.setQuery("")}>Clear search</Button> }
    : ui.category !== "all"
      ? { title: `No ${categoryInfo(ui.category).label} tasks`, message: "Try another category, or add one here.", action: <Button onClick={() => ui.openForm({ dueDate: day, category: ui.category === "all" ? undefined : ui.category })}>New task</Button> }
      : ui.tab === "completed"
        ? { title: "Nothing completed yet", message: "Tick a task off and it lands here." }
        : ui.tab === "upcoming"
          ? { title: "Nothing coming up", message: "You are clear beyond this day." }
          : { title: day === today ? "Nothing planned today" : "A clear day", message: "Add a task and it shows up here.", action: <Button onClick={() => ui.openForm({ dueDate: day })}>New task</Button> }

  return (
    <div className="animate-rise">
      <header className="grid grid-cols-12 items-end gap-x-8">
        <div className="col-span-7 flex items-end justify-between gap-4">
          <Greeting />
          <ThemeToggle className="mb-1 shrink-0" />
        </div>
        <div className="col-span-5">
          <SearchControls />
        </div>
      </header>

      <div className="mt-12">
        <DateStrip selected={day} today={today} onSelect={ui.setSelectedDate} taskCounts={d.taskCounts} />
      </div>

      <div className="mt-12 grid grid-cols-12 items-start gap-x-8">
        <aside className="col-span-5 xl:sticky xl:top-10">
          <ProgressHero progress={d.progress} day={day} today={today} />
          <div className="mt-10">
            <CategoryTabs variant="index" value={ui.category} onChange={ui.setCategory} counts={counts} />
          </div>
        </aside>

        <div className="col-span-7 space-y-8">
          <SegmentedTabs id="status" label="Show tasks" options={tabs} value={ui.tab} onChange={ui.setTab} />
          {d.featured && <FeaturedTask task={d.featured} today={today} />}
          <section role="tabpanel" id="status-panel" aria-labelledby={`status-tab-${ui.tab}`}>
            <h2 className="mb-6 text-h1">
              {listTitle}
              <span className="ml-3 align-middle text-base font-bold tracking-normal text-muted">
                {d.shown.length} {d.shown.length === 1 ? "task" : "tasks"}
              </span>
            </h2>
            <TaskList narrow tasks={d.rest} today={today} day={ui.tab === "today" ? day : undefined} empty={d.featuredInList && d.rest.length === 0 ? undefined : empty} />
          </section>
        </div>
      </div>
    </div>
  )
}
