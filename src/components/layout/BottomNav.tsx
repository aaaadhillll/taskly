import type { Route } from "@/hooks/useRoute"
import { cn } from "@/utils/cn"
import { NAV } from "./nav"

/** Phone and tablet navigation: Home, Calendar, Stats, Settings. The active one turns lime. */
export function BottomNav({ route }: { route: Route }) {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {NAV.filter((item) => item.phone).map((item) => {
          const current = item.active(route)
          return (
            <li key={item.label} className="relative">
              {current && <span aria-hidden className="absolute inset-x-0 top-0 mx-auto h-0.5 w-8 rounded-full bg-accent" />}
              <a
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn("flex h-[4.25rem] flex-col items-center justify-center gap-1 text-xs font-bold transition-colors duration-150", current ? "text-accent-text" : "text-muted hover:text-text")}
              >
                <item.icon aria-hidden className="size-6" strokeWidth={current ? 2.5 : 2} />
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
