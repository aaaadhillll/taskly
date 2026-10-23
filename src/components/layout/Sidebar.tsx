import { Check } from "lucide-react"
import type { Route } from "@/hooks/useRoute"
import { links } from "@/hooks/useRoute"
import { cn } from "@/utils/cn"
import { AddTaskButton } from "./AddTaskButton"
import { NAV } from "./nav"

/** A slim rail, desktop only: the mark, five destinations and a vertical wordmark. */
export function Sidebar({ route }: { route: Route }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-24 flex-col items-center border-r border-line py-8 lg:flex">
      <a href={links.home} aria-label="TASKLY, home" className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-ink">
        <Check aria-hidden className="size-6" strokeWidth={3} />
      </a>

      <div className="mt-8">
        <AddTaskButton route={route} variant="rail" />
      </div>

      <nav aria-label="Main" className="mt-6 flex flex-col gap-2">
        {NAV.map(({ label, href, icon: Icon, active }) => {
          const current = active(route)
          return (
            <a
              key={label}
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex w-[4.5rem] flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-bold transition-colors duration-150",
                current ? "bg-accent/12 text-text [&_svg]:text-accent-text dark:bg-elevated" : "text-muted hover:bg-text/10 hover:text-text",
              )}
            >
              <Icon aria-hidden className="size-6" />
              {label}
            </a>
          )
        })}
      </nav>

      <p aria-hidden className="mt-auto rotate-180 text-xs font-extrabold uppercase tracking-[0.5em] text-muted [writing-mode:vertical-rl]">
        Taskly
      </p>
    </aside>
  )
}
