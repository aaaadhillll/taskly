import { createContext, use, useCallback, useMemo, type ReactNode } from "react"
import { createSampleTasks } from "@/data/sample"
import type { Priority, Task, TaskDraft } from "@/types/task"
import { todayKey } from "@/utils/date"
import { newId } from "@/utils/id"
import { parseTasks } from "@/utils/parse"
import { nextOccurrence } from "@/utils/tasks"
import { useLocalStorage } from "./useLocalStorage"

const TASKS_KEY = "taskly.tasks.v1"

interface TasksApi {
  tasks: Task[]
  add: (draft: TaskDraft) => Task
  update: (id: string, draft: TaskDraft) => void
  remove: (id: string) => void
  toggle: (id: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  removeSubtask: (taskId: string, subtaskId: string) => void
  setPriority: (id: string, priority: Priority) => void
  /** Adds imported tasks, replacing any that share an id */
  merge: (imported: Task[]) => void
  resetToSample: () => void
  clear: () => void
}

const TasksContext = createContext<TasksApi | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
  // The sample tasks are only the very first value: once the key exists (even as []), it wins
  const [tasks, setTasks] = useLocalStorage<Task[]>(TASKS_KEY, () => createSampleTasks(todayKey()), parseTasks)

  const add = useCallback(
    (draft: TaskDraft): Task => {
      const now = new Date().toISOString()
      const task: Task = { ...draft, id: newId(), completed: false, createdAt: now, updatedAt: now, completedAt: null }
      setTasks((prev) => [task, ...prev])
      return task
    },
    [setTasks],
  )

  const update = useCallback(
    (id: string, draft: TaskDraft) => {
      const now = new Date().toISOString()
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...draft, updatedAt: now } : t)))
    },
    [setTasks],
  )

  const remove = useCallback((id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)), [setTasks])

  const toggle = useCallback(
    (id: string) =>
      setTasks((prev) => {
        const task = prev.find((t) => t.id === id)
        if (!task) return prev
        const now = new Date().toISOString()
        const completed = !task.completed
        const changed: Task = { ...task, completed, completedAt: completed ? now : null, updatedAt: now }
        const candidate = completed ? nextOccurrence(task, now) : null
        // Ticking, unticking and re-ticking must not stack up copies of the same future task
        const next = candidate && !prev.some((t) => !t.completed && t.title === candidate.title && t.dueDate === candidate.dueDate && t.repeat === candidate.repeat) ? candidate : null
        return [...(next ? [next] : []), ...prev.map((t) => (t.id === id ? changed : t))]
      }),
    [setTasks],
  )

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) =>
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, updatedAt: new Date().toISOString(), subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) }
            : t,
        ),
      ),
    [setTasks],
  )

  const removeSubtask = useCallback(
    (taskId: string, subtaskId: string) =>
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, updatedAt: new Date().toISOString(), subtasks: t.subtasks.filter((s) => s.id !== subtaskId) } : t)),
      ),
    [setTasks],
  )

  const setPriority = useCallback(
    (id: string, priority: Priority) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority, updatedAt: new Date().toISOString() } : t))),
    [setTasks],
  )

  const merge = useCallback(
    (imported: Task[]) => setTasks((prev) => [...imported, ...prev.filter((t) => !imported.some((i) => i.id === t.id))]),
    [setTasks],
  )
  const resetToSample = useCallback(() => setTasks(createSampleTasks(todayKey())), [setTasks])
  const clear = useCallback(() => setTasks([]), [setTasks])

  const api = useMemo(
    () => ({ tasks, add, update, remove, toggle, toggleSubtask, removeSubtask, setPriority, merge, resetToSample, clear }),
    [tasks, add, update, remove, toggle, toggleSubtask, removeSubtask, setPriority, merge, resetToSample, clear],
  )
  return <TasksContext value={api}>{children}</TasksContext>
}

export function useTasks(): TasksApi {
  const ctx = use(TasksContext)
  if (!ctx) throw new Error("useTasks must be used inside <TasksProvider>")
  return ctx
}
