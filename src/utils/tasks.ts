import type { Priority, PriorityFilter, SortKey, StatsRange, StatusTab, Task } from "@/types/task"
import { addDays, addMonths, dayOf, diffDays, formatDate, startOfMonth, startOfWeek } from "./date"
import { newId } from "./id"

const PRIORITY_RANK: Record<Priority, number> = { low: 0, medium: 1, high: 2 }

/** Earliest first: by day, then time of day, untimed tasks after timed ones. */
export const byDue = (a: Task, b: Task): number =>
  a.dueDate.localeCompare(b.dueDate) || (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99")

export const isOverdue = (task: Task, today: string): boolean => !task.completed && task.dueDate < today

export function matchesQuery(task: Task, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [task.title, task.description, ...task.tags].some((text) => text.toLowerCase().includes(q))
}

/** Tasks for a tab. Today also carries anything overdue, so nothing slips off the screen. */
export function tasksForTab(tasks: Task[], tab: StatusTab, day: string, today: string): Task[] {
  if (tab === "completed") return tasks.filter((t) => t.completed)
  if (tab === "upcoming") return tasks.filter((t) => !t.completed && t.dueDate > day)
  return tasks.filter((t) => t.dueDate === day || (day === today && isOverdue(t, today)))
}

/** "smart" is each tab's natural order: open before done, soonest first; completed by most recent. */
export function sortTasks(tasks: Task[], sort: SortKey, tab: StatusTab): Task[] {
  const list = [...tasks]
  if (sort === "priority") return list.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || byDue(a, b))
  if (sort === "newest") return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sort === "title") return list.sort((a, b) => a.title.localeCompare(b.title))
  if (tab === "completed") return list.sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
  return list.sort((a, b) => Number(a.completed) - Number(b.completed) || byDue(a, b))
}

export function filterTasks(tasks: Task[], query: string, priority: PriorityFilter): Task[] {
  return tasks.filter((t) => matchesQuery(t, query) && (priority === "all" || t.priority === priority))
}

/** The open task to do next: soonest from today on, else the oldest overdue one. */
export function nextUp(tasks: Task[], today: string): Task | undefined {
  const open = tasks.filter((t) => !t.completed).sort(byDue)
  return open.find((t) => t.dueDate >= today) ?? open[0]
}

export interface Progress {
  total: number
  completed: number
  /** Started (some of its checklist is ticked) but not finished */
  inProgress: number
  remaining: number
}

export function progressOf(tasks: Task[]): Progress {
  const completed = tasks.filter((t) => t.completed).length
  const inProgress = tasks.filter((t) => !t.completed && t.subtasks.some((s) => s.done)).length
  return { total: tasks.length, completed, inProgress, remaining: tasks.length - completed - inProgress }
}

/** Consecutive days with a completion, ending today (or yesterday if today has none yet). */
export function streakOf(tasks: Task[], today: string): number {
  const days = new Set(tasks.filter((t) => t.completedAt).map((t) => dayOf(t.completedAt!)))
  let streak = 0
  for (let d = days.has(today) ? today : addDays(today, -1); days.has(d); d = addDays(d, -1)) streak++
  return streak
}

export interface Bar {
  label: string
  /** Shorter label for narrow screens, where twelve month names don't fit */
  compact?: string
  name: string
  value: number
  current: boolean
}

export interface Stats {
  rate: number
  /** How many tasks fall due in the period (0 means there is nothing to compare) */
  due: number
  completed: number
  bars: Bar[]
}

/**
 * Completion rate, total and per-bucket counts for the week, month or year containing `today`. A period
 * that is still under way counts only the tasks due up to `now`, so its rate isn't dragged down by
 * work that isn't due yet (and can be compared fairly with a finished period).
 */
export function statsFor(tasks: Task[], range: StatsRange, today: string, now: string = today): Stats {
  let start: string
  let end: string
  let bars: Bar[]
  let bucket: (day: string) => number

  if (range === "week") {
    start = startOfWeek(today)
    end = addDays(start, 6)
    bars = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i)
      return { label: formatDate(d, { weekday: "short" }), name: formatDate(d, { weekday: "long" }), value: 0, current: d === today }
    })
    bucket = (day) => diffDays(day, start)
  } else if (range === "month") {
    start = startOfMonth(today)
    end = addDays(addMonths(start, 1), -1)
    const last = Number(end.slice(8))
    bars = Array.from({ length: Math.ceil(last / 7) }, (_, i) => {
      const from = i * 7 + 1
      const to = Math.min(from + 6, last)
      const day = Number(today.slice(8))
      return { label: `${from}-${to}`, name: `Days ${from} to ${to}`, value: 0, current: day >= from && day <= to }
    })
    bucket = (day) => Math.floor((Number(day.slice(8)) - 1) / 7)
  } else {
    const year = today.slice(0, 4)
    start = `${year}-01-01`
    end = `${year}-12-31`
    bars = Array.from({ length: 12 }, (_, i) => {
      const d = `${year}-${String(i + 1).padStart(2, "0")}-01`
      return {
        label: formatDate(d, { month: "short" }),
        compact: formatDate(d, { month: "narrow" }),
        name: formatDate(d, { month: "long" }),
        value: 0,
        current: i + 1 === Number(today.slice(5, 7)),
      }
    })
    bucket = (day) => Number(day.slice(5, 7)) - 1
  }

  let completed = 0
  for (const t of tasks) {
    if (!t.completedAt) continue
    const day = dayOf(t.completedAt)
    const bar = day >= start && day <= end ? bars[bucket(day)] : undefined
    if (bar) {
      bar.value++
      completed++
    }
  }
  const due = tasks.filter((t) => t.dueDate >= start && t.dueDate <= (end < now ? end : now))
  const rate = due.length ? Math.round((due.filter((t) => t.completed).length / due.length) * 100) : 0
  return { rate, due: due.length, completed, bars }
}

/** The day a repeating task comes back on, or null when it doesn't repeat. */
export function nextDue(task: Task): string | null {
  if (task.repeat === "daily") return addDays(task.dueDate, 1)
  if (task.repeat === "weekly") return addDays(task.dueDate, 7)
  if (task.repeat === "monthly") return addMonths(task.dueDate, 1)
  return null
}

/** A fresh, unticked copy of a repeating task for its next day. */
export function nextOccurrence(task: Task, now: string): Task | null {
  const dueDate = nextDue(task)
  if (!dueDate) return null
  return {
    ...task,
    id: newId(),
    dueDate,
    completed: false,
    completedAt: null,
    subtasks: task.subtasks.map((s) => ({ ...s, id: newId(), done: false })),
    createdAt: now,
    updatedAt: now,
  }
}

/** A day inside the period before the current week, month or year, for comparing the two. */
export const previousAnchor = (range: StatsRange, today: string): string =>
  range === "week" ? addDays(today, -7) : addMonths(today, range === "month" ? -1 : -12)
