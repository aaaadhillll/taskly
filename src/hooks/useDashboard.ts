import { useMemo } from "react"
import type { CategoryValue } from "@/components/dashboard/CategoryTabs"
import type { Task } from "@/types/task"
import { todayKey } from "@/utils/date"
import { filterTasks, nextUp, progressOf, sortTasks, tasksForTab } from "@/utils/tasks"
import { useTasks } from "./useTasks"
import { useUi } from "./useUi"

/** How many of `list` sit in each category, plus the total under "all". */
export const countByCategory = (list: Task[]): Record<CategoryValue, number> => {
  const counts: Record<string, number> = { all: list.length }
  for (const t of list) counts[t.category] = (counts[t.category] ?? 0) + 1
  return counts as Record<CategoryValue, number>
}

/** Everything the dashboard screens derive from the tasks and the current view state. */
export function useDashboard() {
  const { tasks } = useTasks()
  const ui = useUi()
  const today = todayKey()
  const day = ui.selectedDate

  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of tasks) counts.set(t.dueDate, (counts.get(t.dueDate) ?? 0) + 1)
    return counts
  }, [tasks])

  const progress = progressOf(tasks.filter((t) => t.dueDate === day))

  // Home: the selected day, filtered by category, in its natural order
  const homeDay = tasksForTab(tasks, "today", day, today)
  const homeShown = sortTasks(homeDay.filter((t) => ui.category === "all" || t.category === ui.category), "smart", "today")

  // Tasks and desktop: the status tab, search, priority and sort all apply
  const inTab = tasksForTab(tasks, ui.tab, day, today)
  const searching = ui.query.trim() !== ""
  const shown = sortTasks(filterTasks(inTab.filter((t) => ui.category === "all" || t.category === ui.category), ui.query, ui.priority), ui.sort, ui.tab)

  // The featured card is the next task overall; it leaves the list below so it isn't shown twice
  const featured = ui.tab !== "completed" && !searching ? nextUp(tasks, today) : undefined
  const featuredInList = featured !== undefined && shown.some((t) => t.id === featured.id)
  const rest = featuredInList ? shown.filter((t) => t.id !== featured.id) : shown

  return {
    ui,
    tasks,
    today,
    day,
    taskCounts,
    progress,
    homeDay,
    homeShown,
    inTab,
    shown,
    rest,
    featured,
    featuredInList,
    searching,
    listTitle:
      ui.tab === "completed" ? "Completed" : ui.tab === "upcoming" ? "Upcoming" : undefined,
  }
}
