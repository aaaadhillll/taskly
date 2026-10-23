import { Flag, Trash2 } from "lucide-react"
import { useRef } from "react"
import { categoryInfo } from "@/data/categories"
import { links } from "@/hooks/useRoute"
import { useTasks } from "@/hooks/useTasks"
import { useUi } from "@/hooks/useUi"
import type { Task } from "@/types/task"
import { cn } from "@/utils/cn"
import { formatTime, relativeDay } from "@/utils/date"
import { isOverdue } from "@/utils/tasks"
import { PriorityTag } from "@/components/ui/PriorityTag"
import { CheckButton } from "./CheckButton"
import { TaskMenu } from "./TaskMenu"
import { useSwipeReveal } from "./useSwipeReveal"

interface TaskCardProps {
  task: Task
  today: string
  /** The day this list is showing. Tasks on that day show only their time; others name their day too. */
  day?: string
  /** "card" is its own rounded card; "plain" is a bare row for use inside another card (the calendar's day card) */
  variant?: "card" | "plain"
  /** Show the ⋮ menu (and allow swiping the row open). Off in the calendar's day card, as in the design. */
  menu?: boolean
}

const TRAY = 144 // two 72px actions

export function TaskCard({ task, today, day, variant = "card", menu = true }: TaskCardProps) {
  const { toggle, setPriority } = useTasks()
  const { requestDelete } = useUi()
  const { icon: CategoryIcon, label: categoryLabel } = categoryInfo(task.category)
  const overdue = isOverdue(task, today)
  const time = task.dueTime ? formatTime(task.dueTime) : ""
  const when = task.dueDate === day ? time || "Any time" : [relativeDay(task.dueDate, today), time].filter(Boolean).join(" · ")
  const stepsDone = task.subtasks.filter((s) => s.done).length
  const plain = variant === "plain"

  const li = useRef<HTMLLIElement>(null)
  const swipe = useSwipeReveal(TRAY, !plain && menu, task.id, li)
  const flagged = task.priority === "high"

  return (
    <li
      ref={li}
      data-done={task.completed}
      className={cn("card-link @container relative", plain ? "" : "overflow-hidden rounded-2xl md:rounded-4xl")}
    >
      {/* The actions behind the row: revealed by swiping it left. Hidden and inert until then. */}
      {!plain && menu && (
        <div inert={!swipe.open} className={cn("absolute inset-y-0 right-0 flex", !swipe.open && !swipe.dragging && "invisible")} style={{ width: TRAY }}>
          <button
            type="button"
            aria-label={`${flagged ? "Remove flag from" : "Flag"} "${task.title}"`}
            onClick={() => {
              setPriority(task.id, flagged ? "medium" : "high")
              swipe.close()
            }}
            className="flex flex-1 flex-col items-center justify-center gap-1 bg-warning text-xs font-extrabold text-accent-ink transition duration-150 active:brightness-90"
          >
            <Flag aria-hidden className={cn("size-5", flagged && "fill-current")} />
            {flagged ? "Unflag" : "Flag"}
          </button>
          <button
            type="button"
            aria-label={`Delete "${task.title}"`}
            onClick={() => {
              swipe.close()
              requestDelete(task)
            }}
            className="flex flex-1 flex-col items-center justify-center gap-1 bg-danger text-xs font-extrabold text-accent-ink transition duration-150 active:brightness-90"
          >
            <Trash2 aria-hidden className="size-5" />
            Delete
          </button>
        </div>
      )}

      <div
        {...(plain || !menu ? {} : swipe.bind)}
        style={swipe.offset ? { transform: `translateX(${swipe.offset}px)` } : undefined}
        className={cn(
          "relative flex items-center gap-1 transition-colors",
          !plain && menu && "touch-pan-y",
          !swipe.dragging && "transition-transform duration-200 ease-out",
          plain
            ? "py-1.5 md:py-3"
            : cn(
                "py-1.5 pl-1.5 pr-1 md:gap-2 md:py-4 md:pl-5 md:pr-3",
                "[&_button:focus-visible]:outline-offset-[-3px]", // rings stay inside the clipped row
                // A finished task recedes into the page instead of dimming its text (which would fail contrast).
                // Opaque, so the tray behind it never shows through.
                task.completed ? "bg-[color-mix(in_srgb,var(--color-surface)_50%,var(--color-canvas))]" : "bg-surface hover:bg-elevated",
              ),
        )}
      >
        <CheckButton checked={task.completed} label={`Mark "${task.title}" as ${task.completed ? "not done" : "complete"}`} onToggle={() => toggle(task.id)} />

        <div className="min-w-0 flex-1 pl-1.5 md:pl-1">
          <h3 className={cn("text-task break-words", task.completed && "text-muted line-through decoration-2")}>
            {/* The link stretches over the whole row; the check and menu beside it stay separately clickable */}
            <a href={links.task(task.id)} draggable={false} className="outline-none after:absolute after:inset-0">
              {task.title}
            </a>
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-muted md:mt-1.5 md:gap-x-4 md:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CategoryIcon aria-hidden className="hidden size-4 md:block" />
              {categoryLabel}
              <span aria-hidden className="md:hidden">·</span>
            </span>
            <span className={cn(overdue && "font-bold text-danger-text")}>{overdue ? `Overdue · ${when}` : when}</span>
            {task.subtasks.length > 0 && <span>{stepsDone}/{task.subtasks.length} steps</span>}
          </p>
        </div>

        <PriorityTag priority={task.priority} variant="inline" compact muted={task.completed} className="shrink-0 px-1 text-[13px] md:text-sm" />
        {menu ? <TaskMenu task={task} /> : <span className="w-2 md:w-3" />}
      </div>
    </li>
  )
}
