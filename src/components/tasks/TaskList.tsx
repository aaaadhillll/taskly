import type { ReactNode } from "react"
import type { Task } from "@/types/task"
import { EmptyState } from "@/components/ui/EmptyState"
import { TaskCard } from "./TaskCard"

interface TaskListProps {
  tasks: Task[]
  today: string
  /** The day being listed, so its tasks can leave the date out of their meta line */
  day?: string
  /** "plain" rows sit inside another card, separated by hairlines */
  variant?: "card" | "plain"
  menu?: boolean
  /** The list sits in a narrow column (the desktop dashboard's right side): one column until there is real room */
  narrow?: boolean
  /** Shown instead of the list when there is nothing to list */
  empty?: { title: string; message: string; action?: ReactNode }
}

export function TaskList({ tasks, today, day, variant = "card", menu, narrow, empty }: TaskListProps) {
  if (tasks.length === 0) return empty ? <EmptyState {...empty} /> : null
  return (
    <ul className={variant === "plain" ? "divide-y divide-line" : narrow ? "grid grid-cols-1 gap-2.5 md:gap-3 2xl:grid-cols-2" : "grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3"}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} today={today} day={day} variant={variant} menu={menu} />
      ))}
    </ul>
  )
}
