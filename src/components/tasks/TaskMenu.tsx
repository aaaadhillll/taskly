import { Check, Flag, Pencil, Trash2 } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { useUi } from "@/hooks/useUi"
import type { Task } from "@/types/task"
import { ActionMenu } from "@/components/ui/ActionMenu"

/** The menu on a task row and on the detail header: edit, tick, delete. */
export function TaskMenu({ task, triggerClassName }: { task: Task; triggerClassName?: string }) {
  const { toggle, setPriority } = useTasks()
  const { openForm, requestDelete } = useUi()
  return (
    <ActionMenu
      label={`Actions for "${task.title}"`}
      triggerClassName={triggerClassName}
      items={[
        { label: "Edit", icon: Pencil, run: () => openForm({ task }) },
        { label: task.completed ? "Mark as not done" : "Mark as complete", icon: Check, run: () => toggle(task.id) },
        { label: task.priority === "high" ? "Remove flag" : "Flag as high priority", icon: Flag, run: () => setPriority(task.id, task.priority === "high" ? "medium" : "high") },
        { label: "Delete", icon: Trash2, danger: true, run: () => requestDelete(task) },
      ]}
    />
  )
}
