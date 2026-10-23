import { Ellipsis, Trash2 } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import type { Task } from "@/types/task"
import { cn } from "@/utils/cn"
import { ActionMenu } from "@/components/ui/ActionMenu"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { CheckButton } from "./CheckButton"

/**
 * A task's steps: "Checklist (2/4)", a progress bar, and one row per step to tick or remove. Sits
 * inside a light or dark card, so it uses only the theme tokens, which that card re-points.
 */
export function Checklist({ task }: { task: Task }) {
  const { toggleSubtask, removeSubtask } = useTasks()
  const done = task.subtasks.filter((s) => s.done).length
  const total = task.subtasks.length
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <section aria-labelledby="checklist-title">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="checklist-title" className="text-base font-extrabold">
          Checklist{total > 0 && <span className="ml-1.5 font-bold text-muted">({done}/{total})</span>}
        </h2>
        {total > 0 && <p className="text-sm font-semibold text-muted">{percent}%</p>}
      </div>

      {total === 0 ? (
        <p className="mt-2 text-[15px] font-medium text-muted">No steps yet. Edit the task to break it down.</p>
      ) : (
        <>
          <ProgressBar value={percent} label="Checklist progress" className="mt-3 h-2" />
          <ul className="mt-2">
            {task.subtasks.map((step) => (
              <li key={step.id} data-done={step.done} className="flex items-center gap-1">
                <CheckButton checked={step.done} label={`Mark "${step.title}" as ${step.done ? "not done" : "done"}`} onToggle={() => toggleSubtask(task.id, step.id)} />
                <span className={cn("min-w-0 flex-1 break-words text-[15px] font-semibold", step.done && "text-muted line-through decoration-2")}>{step.title}</span>
                <ActionMenu label={`Actions for step "${step.title}"`} icon={Ellipsis} items={[{ label: "Remove step", icon: Trash2, danger: true, run: () => removeSubtask(task.id, step.id) }]} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
