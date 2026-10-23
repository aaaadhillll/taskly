import { categoryInfo } from "@/data/categories"
import { useDashboard, countByCategory } from "@/hooks/useDashboard"
import { links } from "@/hooks/useRoute"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { formatDate } from "@/utils/date"
import { nextUp } from "@/utils/tasks"
import { Avatar, Greeting } from "@/components/dashboard/Greeting"
import { CategoryTabs } from "@/components/dashboard/CategoryTabs"
import { DateStrip } from "@/components/dashboard/DateStrip"
import { ProgressHero } from "@/components/dashboard/ProgressHero"
import { FeaturedTask } from "@/components/tasks/FeaturedTask"
import { TaskList } from "@/components/tasks/TaskList"
import { Button } from "@/components/ui/Button"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { DesktopDashboard } from "./DesktopDashboard"

/** Home. On a phone: greeting, days, progress, category pills, today's tasks. On desktop: the editorial dashboard. */
export function Home() {
  const desktop = useIsDesktop()
  const d = useDashboard()
  const { ui, day, today } = d
  if (desktop) return <DesktopDashboard />

  const counts = countByCategory(d.homeDay)
  const featured = nextUp(d.tasks, today)
  const title = day === today ? "Today's Tasks" : formatDate(day, { weekday: "short", month: "short", day: "numeric" })
  const empty =
    ui.category !== "all"
      ? {
          title: `No ${categoryInfo(ui.category).label} tasks`,
          message: "Try another category, or add one.",
          action: <Button onClick={() => ui.openForm({ dueDate: day, category: ui.category === "all" ? undefined : ui.category })}>New task</Button>,
        }
      : { title: day === today ? "Nothing planned today" : "A clear day", message: "Add a task and it shows up here.", action: <Button onClick={() => ui.openForm({ dueDate: day })}>New task</Button> }

  return (
    <div className="animate-rise flex flex-1 flex-col gap-4 md:gap-6">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Greeting />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Avatar />
        </div>
      </header>

      <DateStrip selected={day} today={today} onSelect={ui.setSelectedDate} taskCounts={d.taskCounts} />

      {/* Tablet: the next task sits beside the progress card. On a phone it lives on the Tasks screen. */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <ProgressHero progress={d.progress} day={day} today={today} />
        {featured && <FeaturedTask task={featured} today={today} className="hidden md:block" />}
      </div>

      <CategoryTabs variant="scroll" tone="cream" browse value={ui.category} onChange={ui.setCategory} counts={counts} />

      <section aria-labelledby="home-tasks-title" className="flex flex-1 flex-col">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <h2 id="home-tasks-title" className="text-base font-bold">
            {title}
          </h2>
          <a href={links.tasks} className="grid min-h-11 min-w-11 place-items-center px-1 text-sm font-bold text-accent-text">
            See all
          </a>
        </div>
        <TaskList tasks={d.homeShown} today={today} day={day} empty={empty} />
      </section>
    </div>
  )
}

