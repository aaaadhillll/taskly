import type { Priority, Repeat, Subtask, Task } from "@/types/task"
import { isDateKey, todayKey } from "./date"
import { newId } from "./id"

const PRIORITIES: Priority[] = ["low", "medium", "high"]
const REPEATS: Repeat[] = ["none", "daily", "weekly", "monthly"]

const text = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback)
const isIso = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v))

function parseSubtask(raw: unknown): Subtask | null {
  if (!raw || typeof raw !== "object") return null
  const s = raw as Record<string, unknown>
  if (typeof s.title !== "string" || !s.title.trim()) return null
  return { id: text(s.id) || newId(), title: s.title, done: s.done === true }
}

/** Never trust storage or an imported file: keep well-formed tasks and fill the fields older saves lack. */
export function parseTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== "object") return null
  const t = raw as Record<string, unknown>
  if (typeof t.id !== "string" || typeof t.title !== "string" || !t.title.trim() || typeof t.completed !== "boolean") return null

  const now = new Date().toISOString()
  const createdAt = isIso(t.createdAt) ? t.createdAt : now
  const updatedAt = isIso(t.updatedAt) ? t.updatedAt : createdAt
  return {
    id: t.id,
    title: t.title,
    description: text(t.description),
    completed: t.completed,
    priority: PRIORITIES.includes(t.priority as Priority) ? (t.priority as Priority) : "medium",
    category: typeof t.category === "string" && t.category.trim() ? t.category : "personal",
    tags: Array.isArray(t.tags) ? t.tags.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [],
    dueDate: isDateKey(t.dueDate) ? t.dueDate : todayKey(),
    dueTime: typeof t.dueTime === "string" && /^\d{2}:\d{2}$/.test(t.dueTime) ? t.dueTime : "",
    repeat: REPEATS.includes(t.repeat as Repeat) ? (t.repeat as Repeat) : "none",
    subtasks: Array.isArray(t.subtasks) ? t.subtasks.map(parseSubtask).filter((s): s is Subtask => s !== null) : [],
    createdAt,
    updatedAt,
    // A completed task always has a completion time, an open one never does
    completedAt: t.completed ? (isIso(t.completedAt) ? t.completedAt : updatedAt) : null,
  }
}

/** Returns undefined (not []) for anything that isn't a list, so callers can fall back to defaults. */
export function parseTasks(raw: unknown): Task[] | undefined {
  if (!Array.isArray(raw)) return undefined
  return raw.map(parseTask).filter((t): t is Task => t !== null)
}
