import { ChevronLeft, CalendarDays, Check, Flag, Repeat as RepeatIcon, Tag } from "lucide-react"
import type { ReactNode } from "react"
import { categoryInfo } from "@/data/categories"
import { goBack, links } from "@/hooks/useRoute"
import { useTasks } from "@/hooks/useTasks"
import type { Repeat } from "@/types/task"
import { cn } from "@/utils/cn"
import { formatTime, relativeDay, todayKey } from "@/utils/date"
import { isOverdue, nextDue } from "@/utils/tasks"
import { Checklist } from "@/components/tasks/Checklist"
import { TaskMenu } from "@/components/tasks/TaskMenu"
import { Button, buttonClass } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { PriorityTag } from "@/components/ui/PriorityTag"

const REPEAT_TEXT: Record<Repeat, string> = { none: "Does not repeat", daily: "Every day", weekly: "Every week", monthly: "Every month" }

function Row({ icon: Icon, label, children }: { icon: typeof Tag; label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center gap-3 py-1.5">
      <Icon aria-hidden className="size-5 shrink-0 text-muted" />
      <dt className="text-[15px] font-medium text-muted">{label}</dt>
      <dd className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 text-right text-[15px] font-bold">{children}</dd>
    </div>
  )
}

/** A task: its title and notes on the page, everything else on one light card, ending in the main action. */
export function TaskDetail({ id }: { id: string }) {
  const { tasks, toggle } = useTasks()
  const task = tasks.find((t) => t.id === id)
  const today = todayKey()

  if (!task) {
    return (
      <div className="animate-rise mx-auto max-w-xl pt-8">
        <EmptyState
          title="That task is gone"
          message="It may have been deleted, or the link is out of date."
          action={
            <a href={links.home} className={buttonClass()}>
              Back to home
            </a>
          }
        />
      </div>
    )
  }

  const { icon: CategoryIcon, label: categoryLabel, tint } = categoryInfo(task.category)
  const overdue = isOverdue(task, today)
  const upcoming = nextDue(task)

  return (
    <article className="animate-rise mx-auto w-full max-w-2xl lg:grid lg:max-w-none lg:grid-cols-12 lg:gap-x-10">
      <div className="lg:col-span-7">
        <div className="flex items-center justify-between gap-3">
          <a
            href={links.home}
            aria-label="Back"
            onClick={(e) => {
              e.preventDefault()
              goBack(links.home)
            }}
            className="grid size-11 place-items-center rounded-full bg-btn text-text ring-1 ring-inset ring-edge transition-colors duration-150 hover:bg-btn-hover"
          >
            <ChevronLeft aria-hidden className="size-5" strokeWidth={2.5} />
          </a>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-11 place-items-center rounded-xl bg-surface",
                task.priority === "high" ? "text-danger-text" : task.priority === "medium" ? "text-warning-text" : "text-muted",
              )}
            >
              <Flag aria-hidden className={cn("size-5", task.priority === "high" && "fill-current")} />
              <span className="sr-only">{task.priority} priority</span>
            </span>
            <TaskMenu task={task} triggerClassName="size-11 rounded-xl bg-surface" />
          </div>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-2 md:mt-10">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold", tint)}>
            <CategoryIcon aria-hidden className="size-3.5" />
            {categoryLabel}
          </span>
          {task.completed && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[13px] font-bold text-accent-ink">
              <Check aria-hidden className="size-3.5" strokeWidth={3.5} />
              Completed
            </span>
          )}
        </p>

        <h1 className={cn("mt-3 break-words text-page md:mt-5", task.completed && "text-muted")}>{task.title}</h1>
        {task.description && <p className="mt-2 max-w-xl whitespace-pre-line text-[15px] font-medium leading-relaxed text-muted md:mt-5 md:text-[17px]">{task.description}</p>}
      </div>

      <section aria-label="Task details" className="mt-5 rounded-3xl bg-surface p-4 md:mt-10 md:rounded-4xl md:p-8 lg:col-span-5 lg:mt-0 lg:self-start lg:sticky lg:top-8">
        <dl className="divide-y divide-line">
          <Row icon={CalendarDays} label="Due Date">
            <span className={cn(overdue && "text-danger-text")}>
              {overdue && "Overdue · "}
              {relativeDay(task.dueDate, today)}
              {task.dueTime && `, ${formatTime(task.dueTime)}`}
            </span>
          </Row>
          <Row icon={RepeatIcon} label="Repeat">
            <span className={cn(task.repeat === "none" && "font-medium text-muted")}>{REPEAT_TEXT[task.repeat]}</span>
          </Row>
          <Row icon={Flag} label="Priority">
            <PriorityTag priority={task.priority} variant="chip" />
          </Row>
          <Row icon={Tag} label="Tags">
            {task.tags.length ? (
              task.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-elevated px-3 py-1 text-[13px] font-bold">
                  {tag}
                </span>
              ))
            ) : (
              <span className="font-medium text-muted">No tags</span>
            )}
          </Row>
        </dl>

        <div className="mt-4 border-t border-line pt-4">
          <Checklist task={task} />
        </div>

        <Button variant="solid" size="lg" className="mt-5 w-full" onClick={() => toggle(task.id)}>
          {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
        </Button>
        {!task.completed && upcoming && <p className="mt-3 text-center text-[13px] font-medium text-muted">Completing this schedules the next one for {relativeDay(upcoming, today).toLowerCase()}.</p>}
      </section>
    </article>
  )
}
