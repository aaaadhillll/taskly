import { Search } from "lucide-react"
import { categoryInfo } from "@/data/categories"
import { useDashboard } from "@/hooks/useDashboard"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import type { StatusTab } from "@/types/task"
import { formatDate } from "@/utils/date"
import { Avatar } from "@/components/dashboard/Greeting"
import { SearchControls } from "@/components/dashboard/SearchControls"
import { FeaturedTask } from "@/components/tasks/FeaturedTask"
import { TaskList } from "@/components/tasks/TaskList"
import { Button } from "@/components/ui/Button"
import { SegmentedTabs } from "@/components/ui/SegmentedTabs"
import { DesktopDashboard } from "./DesktopDashboard"

/** The full task list: Today | Upcoming | Completed, the next task up, then the list with search and sort. */
export function TasksPage() {
  const desktop = useIsDesktop()
  const d = useDashboard()
  const { ui, day, today } = d
  if (desktop) return <DesktopDashboard />

  const tabs: { value: StatusTab; label: string }[] = [
    { value: "today", label: day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric" }) },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ]
  const title =
    ui.tab === "completed" ? "Completed" : ui.tab === "upcoming" ? "Upcoming" : day === today ? "Today's Tasks" : formatDate(day, { weekday: "short", month: "short", day: "numeric" })

  const empty = d.searching
    ? { title: "No matches", message: `Nothing matches "${ui.query.trim()}".`, action: <Button variant="secondary" onClick={() => ui.setQuery("")}>Clear search</Button> }
    : ui.category !== "all"
      ? { title: `No ${categoryInfo(ui.category).label} tasks`, message: "Clear the category to see everything.", action: <Button variant="secondary" onClick={() => ui.setCategory("all")}>Show all</Button> }
      : ui.tab === "completed"
        ? { title: "Nothing completed yet", message: "Tick a task off and it lands here." }
        : ui.tab === "upcoming"
          ? { title: "Nothing coming up", message: "You are clear beyond this day." }
          : { title: day === today ? "Nothing planned today" : "A clear day", message: "Add a task and it shows up here.", action: <Button onClick={() => ui.openForm({ dueDate: day })}>New task</Button> }

  return (
    <div className="animate-rise flex flex-1 flex-col gap-4 md:gap-6">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h1 className="text-page">Tasks</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={ui.searchOpen ? "Close search" : "Search tasks"}
            aria-expanded={ui.searchOpen}
            onClick={() => ui.setSearchOpen(!ui.searchOpen)}
            className="grid size-11 place-items-center rounded-full text-text transition-colors duration-150 hover:bg-text/10"
          >
            <Search aria-hidden className="size-5" />
          </button>
          <Avatar />
        </div>
      </header>

      {ui.searchOpen && <SearchControls />}

      <SegmentedTabs id="status" label="Show tasks" options={tabs} value={ui.tab} onChange={ui.setTab} />

      <div role="tabpanel" id="status-panel" aria-labelledby={`status-tab-${ui.tab}`} className="flex flex-1 flex-col gap-4">
        {d.featured && <FeaturedTask task={d.featured} today={today} tone="lime" />}
        <section aria-labelledby="tasks-title" className="flex flex-1 flex-col">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h2 id="tasks-title" className="text-base font-bold">
              {title}
              <span className="ml-2 text-sm font-semibold text-muted">{d.shown.length}</span>
            </h2>
            <button type="button" aria-expanded={ui.searchOpen} onClick={() => ui.setSearchOpen(!ui.searchOpen)} className="grid min-h-11 min-w-11 place-items-center px-1 text-sm font-bold text-accent-text">
              Filters
            </button>
          </div>
          <TaskList tasks={d.rest} today={today} day={ui.tab === "today" ? day : undefined} empty={d.featuredInList && d.rest.length === 0 ? undefined : empty} />
        </section>
      </div>
    </div>
  )
}
