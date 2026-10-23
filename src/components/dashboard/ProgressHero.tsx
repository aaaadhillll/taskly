import { ArrowUpRight } from "lucide-react"
import { links } from "@/hooks/useRoute"
import { cn } from "@/utils/cn"
import { formatDate } from "@/utils/date"
import type { Progress } from "@/utils/tasks"
import { ProgressBar } from "@/components/ui/ProgressBar"

interface ProgressHeroProps {
  progress: Progress
  day: string
  today: string
  className?: string
}

/** The lime hero card: how far along the selected day is. Compact on phones, big on desktop. */
export function ProgressHero({ progress, day, today, className }: ProgressHeroProps) {
  const percent = progress.total ? (progress.completed / progress.total) * 100 : 0
  const title = day === today ? "Today's Progress" : `${formatDate(day, { weekday: "short", day: "numeric" })} Progress`
  const stats = [
    { label: "Completed", value: progress.completed },
    { label: "In Progress", value: progress.inProgress },
    { label: "Remaining", value: progress.remaining },
  ]

  return (
    <section data-surface="accent" aria-labelledby="progress-title" className={cn("rounded-3xl bg-accent p-4 text-accent-ink md:rounded-4xl md:p-8", className)}>
      <div className="flex items-start justify-between gap-4">
        <h2 id="progress-title" className="pt-1 text-[15px] font-bold md:pt-2 md:text-xs md:font-extrabold md:uppercase md:tracking-[0.16em]">
          {title}
        </h2>
        <a
          href={links.stats}
          aria-label="Open your stats"
          className="-mb-4 grid size-11 shrink-0 place-items-center rounded-full bg-accent-ink text-accent transition duration-150 hover:scale-105 active:brightness-90 md:mb-0 md:size-14"
        >
          <ArrowUpRight aria-hidden className="size-5 md:size-7" strokeWidth={2.5} />
        </a>
      </div>

      <p aria-live="polite" className="-mt-1 text-[clamp(2.5rem,0.7rem+8.3vw,6.5rem)] font-extrabold leading-none tracking-[-0.05em] tabular-nums md:mt-6">
        {progress.completed}
        <span className="mx-[0.04em] font-semibold opacity-50">/</span>
        {progress.total}
      </p>

      <ProgressBar value={percent} label={`${progress.completed} of ${progress.total} tasks completed`} tone="ink" className="mt-3 h-1.5 md:mt-7 md:h-5" />

      <dl className="mt-3 grid grid-cols-3 md:mt-7">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex min-w-0 flex-col-reverse border-accent-ink/20 pl-3 first:border-0 first:pl-0 [&:not(:first-child)]:border-l">
            <dt className="truncate text-xs font-medium md:font-semibold">{label}</dt>
            <dd className="text-lg font-extrabold tabular-nums md:text-3xl">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
