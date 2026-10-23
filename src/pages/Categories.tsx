import { ArrowUpRight, ChevronLeft, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"
import {
  CATEGORIES, CUSTOM_ICON_LIST, CUSTOM_ICONS, CUSTOM_PALETTES,
  type PaletteId,
} from "@/data/categories"
import { countByCategory } from "@/hooks/useDashboard"
import { useCategories } from "@/hooks/useCategories"
import { goBack, links, navigate } from "@/hooks/useRoute"
import { useTasks } from "@/hooks/useTasks"
import { useUi } from "@/hooks/useUi"
import type { CategoryId } from "@/types/task"
import { cn } from "@/utils/cn"
import { todayKey } from "@/utils/date"
import { filterTasks, sortTasks } from "@/utils/tasks"
import { CategoryTabs, type CategoryValue } from "@/components/dashboard/CategoryTabs"
import { SearchControls } from "@/components/dashboard/SearchControls"
import { TaskList } from "@/components/tasks/TaskList"
import { Button, IconButton } from "@/components/ui/Button"
import { inputClass } from "@/components/ui/Field"
import { Modal } from "@/components/ui/Modal"
import { Orb } from "@/components/ui/Orb"

// ─── Add Category Dialog ─────────────────────────────────────────────────────

function NewCategoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCategory } = useCategories()
  const [label, setLabel] = useState("")
  const [paletteId, setPaletteId] = useState<PaletteId>(CUSTOM_PALETTES[0]!.id)
  const [iconName, setIconName] = useState(CUSTOM_ICON_LIST[0]!)
  const [error, setError] = useState("")

  function reset() {
    setLabel("")
    setPaletteId(CUSTOM_PALETTES[0]!.id)
    setIconName(CUSTOM_ICON_LIST[0]!)
    setError("")
  }

  function handleClose() { reset(); onClose() }

  function handleSave() {
    const trimmed = label.trim()
    if (!trimmed) { setError("Give the category a name."); return }
    addCategory(trimmed, paletteId, iconName)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} labelledBy="new-cat-title" size="small">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="new-cat-title" className="text-xl font-extrabold tracking-tight">New category</h2>
          <IconButton label="Cancel" className="size-9 ring-0" onClick={handleClose}>
            <X aria-hidden className="size-4" />
          </IconButton>
        </div>

        {/* Name */}
        <div className="mt-6">
          <label htmlFor="cat-name" className="mb-2 block text-xs font-semibold text-muted">Name</label>
          <input
            id="cat-name"
            data-autofocus
            value={label}
            onChange={(e) => { setLabel(e.target.value); setError("") }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            maxLength={24}
            placeholder="e.g. Health"
            className={cn(inputClass, error && "ring-danger")}
          />
          {error && <p role="alert" className="mt-1.5 text-xs font-semibold text-danger-text">{error}</p>}
        </div>

        {/* Colour */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-muted">Colour</p>
          <div className="flex flex-wrap gap-2">
            {CUSTOM_PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-label={p.id}
                aria-pressed={paletteId === p.id}
                onClick={() => setPaletteId(p.id)}
                className={cn(
                  "size-8 rounded-full transition duration-150",
                  p.dot,
                  paletteId === p.id ? "ring-2 ring-text ring-offset-2 ring-offset-surface" : "opacity-70 hover:opacity-100",
                )}
              />
            ))}
          </div>
        </div>

        {/* Icon */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-muted">Icon</p>
          <div className="flex flex-wrap gap-2">
            {CUSTOM_ICON_LIST.map((name) => {
              const Icon = CUSTOM_ICONS[name]!
              return (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-pressed={iconName === name}
                  onClick={() => setIconName(name)}
                  className={cn(
                    "grid size-10 place-items-center rounded-xl transition duration-150",
                    iconName === name ? "bg-accent text-accent-ink" : "bg-elevated text-muted hover:text-text",
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Add category</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Categories list page ─────────────────────────────────────────────────────

export function CategoriesPage() {
  const { tasks } = useTasks()
  const { openForm, selectedDate } = useUi()
  const { allCategories, removeCategory } = useCategories()
  const [dialogOpen, setDialogOpen] = useState(false)

  const rows = allCategories.map((c) => {
    const own = tasks.filter((t) => t.category === c.id)
    const isBuiltin = CATEGORIES.some((b) => b.id === c.id)
    return { ...c, total: own.length, open: own.filter((t) => !t.completed).length, done: own.filter((t) => t.completed).length, isBuiltin }
  })
  const busiest = [...rows].sort((a, b) => b.open - a.open)[0]?.id

  return (
    <div className="animate-rise">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-page">Categories</h1>
          <p className="mt-1 text-sm font-medium text-muted md:mt-3 md:text-[17px]">Everything you are working on, by area.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus aria-hidden className="size-4" />
            New
          </Button>
          <IconButton label="New task" onClick={() => openForm({ dueDate: selectedDate })} className="size-11 bg-accent text-accent-ink ring-0 hover:bg-accent hover:brightness-105 md:size-12">
            <Plus aria-hidden className="size-5" strokeWidth={2.75} />
          </IconButton>
        </div>
      </header>

      <ul className="mt-4 grid grid-cols-1 gap-2.5 md:mt-10 md:grid-cols-2 md:gap-4 lg:gap-6 xl:grid-cols-3">
        {rows.map(({ id, label, icon: Icon, tint, total, open, done, isBuiltin }) => {
          const lime = id === busiest && open > 0
          const tinted = !lime && (id === "study" || id === "travel")
          return (
            <li key={id} className="group/card relative">
              <a
                href={links.category(id)}
                data-surface={lime ? "accent" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-3xl p-3.5 transition duration-150 active:brightness-95 md:min-h-56 md:flex-wrap md:content-between md:items-start md:rounded-4xl md:p-7",
                  lime ? "bg-accent text-accent-ink" : "bg-surface text-text hover:bg-elevated",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-11 shrink-0 place-items-center md:order-1 md:size-14",
                    tinted ? cn(tint, "rounded-xl") : cn("rounded-full", lime ? "bg-accent-ink text-accent" : "bg-[#0b0c0b] text-cream dark:bg-elevated dark:text-text"),
                  )}
                >
                  <Icon className="size-5 md:size-6" />
                </span>
                <span className="min-w-0 flex-1 md:order-3 md:basis-full md:flex-none">
                  <span className="block text-base font-bold md:text-h1">{label}</span>
                  <span className="mt-0.5 block text-[13px] font-medium text-muted md:mt-2 md:text-[17px] md:font-bold">
                    <span className="md:hidden">{total} {total === 1 ? "task" : "tasks"}</span>
                    <span className="hidden md:inline">{open} open · {done} done</span>
                  </span>
                </span>
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-text/10 transition-colors duration-150 group-hover:bg-text/15 md:order-2 md:size-12">
                  <ArrowUpRight className="size-4 md:size-6" />
                </span>
              </a>

              {/* Delete button — only on custom categories */}
              {!isBuiltin && (
                <button
                  type="button"
                  aria-label={`Delete ${label} category`}
                  onClick={() => removeCategory(id)}
                  className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-surface/80 text-muted opacity-0 ring-1 ring-edge backdrop-blur-sm transition duration-150 hover:text-danger group-hover/card:opacity-100 focus-visible:opacity-100 md:right-3 md:top-3"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              )}
            </li>
          )
        })}

        {/* Always-visible add button at the end of the grid */}
        <li>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line p-3.5 text-sm font-bold text-muted transition duration-150 hover:border-text/30 hover:text-text md:min-h-56 md:rounded-4xl md:flex-col md:p-7"
          >
            <Plus aria-hidden className="size-5" />
            Add category
          </button>
        </li>
      </ul>

      <NewCategoryDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}

// ─── Single category page ─────────────────────────────────────────────────────

export function CategoryPage({ id }: { id: CategoryId }) {
  const { tasks } = useTasks()
  const { query, priority, sort, openForm, selectedDate } = useUi()
  const { allCategories } = useCategories()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const today = todayKey()

  const catInfo = allCategories.find((c) => c.id === id)
  const { icon: Icon, label } = catInfo ?? { icon: () => null, label: id }

  const own = tasks.filter((t) => t.category === id)
  const shown = sortTasks(filterTasks(own, query, priority), sort, "today")
  const counts = countByCategory(tasks)

  const choose = (value: CategoryValue) => navigate(value === "all" ? links.tasks : links.category(value))

  return (
    <div className="animate-rise flex flex-1 flex-col lg:grid lg:grid-cols-12 lg:gap-x-12">
      <div className="lg:col-span-5">
        <div className="relative isolate -mx-5 overflow-hidden px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:overflow-visible lg:px-0">
          <Orb className="absolute -right-12 -top-14 -z-10 size-56 md:-right-16 md:-top-20 md:size-96 lg:hidden" />
          <a
            href={links.categories}
            aria-label="Back to categories"
            onClick={(e) => { e.preventDefault(); goBack(links.categories) }}
            className="grid size-11 place-items-center rounded-full bg-btn text-text ring-1 ring-inset ring-edge transition-colors duration-150 hover:bg-btn-hover"
          >
            <ChevronLeft aria-hidden className="size-5" strokeWidth={2.5} />
          </a>
          <h1 className="mt-7 flex items-center gap-3 text-page md:mt-12">
            <Icon aria-hidden className="hidden size-[0.7em] text-accent-text md:block" />
            {label}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted md:mt-3 md:text-[17px]">
            {own.length} {own.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <div className="relative mt-4 md:mt-6">
          <CategoryTabs variant="scroll" tone="lime" value={id} onChange={choose} counts={counts} />
        </div>

        <div className="mt-2 md:mt-4">
          <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)} className="grid min-h-11 min-w-11 place-items-center px-1 text-sm font-bold text-accent-text">
            {filtersOpen ? "Hide filters" : "Filters"}
          </button>
          {filtersOpen && <div className="mb-2"><SearchControls /></div>}
        </div>
      </div>

      <section aria-label={`${label} tasks`} className="mt-1 flex flex-1 flex-col lg:col-span-7 lg:mt-0 lg:pt-16">
        <TaskList
          tasks={shown}
          today={today}
          empty={{
            title: own.length ? "No matches" : `No ${label} tasks yet`,
            message: own.length ? "Try a different search or priority." : "Add one and it lands here.",
            action: <Button onClick={() => openForm({ dueDate: selectedDate, category: id })}>New task</Button>,
          }}
        />
      </section>
    </div>
  )
}
