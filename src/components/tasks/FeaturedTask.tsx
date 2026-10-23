import { ArrowUpRight, Clock, ListChecks } from "lucide-react"
import { links } from "@/hooks/useRoute"
import type { Task } from "@/types/task"
import { cn } from "@/utils/cn"
import { formatTime, relativeDay } from "@/utils/date"
import { PriorityTag } from "@/components/ui/PriorityTag"

interface FeaturedTaskProps {
  task: Task
  today: string
  /** "lime" is the phone's Next Up card; "light" is the desktop's, where the lime is already on the progress card */
  tone?: "lime" | "light"
  className?: string
}

/** NEXT UP: the one task to do next, as the biggest module on the page. */
export function FeaturedTask({ task, today, tone = "light", className }: FeaturedTaskProps) {
  const lime = tone === "lime"
  const when = `${relativeDay(task.dueDate, today)}${task.dueTime ? ` · ${formatTime(task.dueTime)}` : ""}`
  const stepsDone = task.subtasks.filter((s) => s.done).length

  return (
    <article
      data-surface={lime ? "accent" : undefined}
      className={cn("card-link relative rounded-3xl p-4 md:rounded-4xl md:p-8", lime ? "bg-accent text-accent-ink" : "bg-surface text-text", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={cn("pt-1 text-[13px] font-semibold md:text-xs md:font-extrabold md:uppercase md:tracking-[0.16em]", lime && "text-accent-ink/80")}>{lime ? "Next Up" : "Next up"}</p>
        <span
          aria-hidden
          className={cn("grid size-11 shrink-0 place-items-center rounded-full md:size-[4.5rem]", lime ? "bg-accent-ink text-accent" : "bg-accent text-accent-ink")}
        >
          <ArrowUpRight className="size-5 md:size-8" strokeWidth={2.5} />
        </span>
      </div>
      <h2 className="-mt-2 max-w-[80%] text-feature break-words md:mt-4 md:max-w-none">
        <a href={links.task(task.id)} className="outline-none after:absolute after:inset-0 after:rounded-3xl md:after:rounded-4xl">
          {task.title}
        </a>
      </h2>
      {!lime && task.description && <p className="mt-3 line-clamp-2 max-w-xl text-[17px] font-medium text-muted">{task.description}</p>}

      <div className={cn("mt-5 md:mt-8", lime ? "flex flex-wrap items-center justify-between gap-x-4 gap-y-2" : "space-y-3")}>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold md:text-[15px] md:font-bold">
          <span className="inline-flex items-center gap-2">
            <Clock aria-hidden className="size-4" />
            {when}
          </span>
          {!lime && task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-2">
              <ListChecks aria-hidden className="size-4" />
              {stepsDone}/{task.subtasks.length} steps
            </span>
          )}
        </p>
        <PriorityTag priority={task.priority} variant="chip" icon="flag" long />
      </div>
    </article>
  )
}
