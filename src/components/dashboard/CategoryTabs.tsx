import { LayoutGrid } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { links } from "@/hooks/useRoute"
import type { CategoryId } from "@/types/task"
import { cn } from "@/utils/cn"

export type CategoryValue = CategoryId | "all"

interface CategoryTabsProps {
  value: CategoryValue
  onChange: (value: CategoryValue) => void
  /** Tasks per category in the current view; "all" is the total */
  counts: Record<string, number>
  /** "scroll" is the phone's swipeable pill row; "index" is the desktop's big typographic list */
  variant: "scroll" | "index"
  /** The selected pill: cream on Home, lime on a category page */
  tone?: "cream" | "lime"
  /** Phone row only: end with a link to the Categories screen */
  browse?: boolean
}

/** Category filter: All (5) | Personal (2) | Work (2) | Gym (1) ... */
export function CategoryTabs({ value, onChange, counts, variant, tone = "cream", browse }: CategoryTabsProps) {
  const { allCategories } = useCategories()
  const options: { value: CategoryValue; label: string }[] = [
    { value: "all", label: "All" },
    ...allCategories.map((c) => ({ value: c.id, label: c.label })),
  ]

  if (variant === "index") {
    return (
      <div role="group" aria-label="Filter by category">
        <ul>
          {options.map((o) => {
            const selected = o.value === value
            const n = counts[o.value] ?? 0
            return (
              <li key={o.value} className="border-t border-line last:border-b">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange(o.value)}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-4 text-left text-task transition-colors duration-150",
                    selected ? "text-text" : "text-muted hover:text-text",
                  )}
                >
                  <span aria-hidden className={cn("size-3 shrink-0 rounded-sm transition-colors duration-150", selected ? "bg-accent ring-1 ring-accent-edge" : "bg-transparent")} />
                  <span className="flex-1">{o.label}</span>
                  <span className="text-base font-bold tabular-nums">{n}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  const lime = tone === "lime"
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className={cn("no-scrollbar flex overflow-x-auto", lime ? "rounded-full bg-surface px-1" : "-mx-5 px-5 sm:-mx-8 sm:px-8")}
    >
      {options.map((o) => {
        const selected = o.value === value
        const n = counts[o.value] ?? 0
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            aria-label={`${o.label}, ${n} ${n === 1 ? "task" : "tasks"}`}
            onClick={() => onChange(o.value)}
            className="group h-11 shrink-0 px-0.5"
          >
            <span
              className={cn(
                "grid h-9 items-center rounded-full px-4 text-[13px] font-semibold transition-colors duration-150",
                selected ? "bg-accent text-accent-ink" : "text-muted group-hover:text-text",
              )}
            >
              {o.label}
              {lime ? "" : ` (${n})`}
            </span>
          </button>
        )
      })}
      {browse && (
        <a href={links.categories} aria-label="All categories" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors duration-150 hover:text-text">
          <LayoutGrid aria-hidden className="size-5" />
        </a>
      )}
    </div>
  )
}
