import { EllipsisVertical, type LucideIcon } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { cn } from "@/utils/cn"

export interface MenuItem {
  label: string
  icon: LucideIcon
  danger?: boolean
  run: () => void
}

interface ActionMenuProps {
  /** Names the menu and its button, e.g. Actions for "Read 20 pages" */
  label: string
  items: MenuItem[]
  /** Overrides the round ghost button the menu opens from */
  triggerClassName?: string
  icon?: LucideIcon
}

/** A small popup menu: arrow keys, Escape, click-away, and it opens upward when there is no room below. */
export function ActionMenu({ label, items, triggerClassName, icon: Icon = EllipsisVertical }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", away)
    return () => document.removeEventListener("pointerdown", away)
  }, [open])

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) trigger.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!open) return
    if (event.key === "Escape") {
      event.stopPropagation()
      close(true)
    } else if (event.key === "Tab") {
      close(false)
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const all = [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
      const at = all.indexOf(document.activeElement as HTMLElement)
      all[(at + (event.key === "ArrowDown" ? 1 : -1) + all.length) % all.length]?.focus()
    }
  }

  return (
    <div ref={root} onKeyDown={onKeyDown} className="relative z-10 shrink-0">
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setUp(!open && (trigger.current?.getBoundingClientRect().bottom ?? 0) > innerHeight - 260)
          setOpen(!open)
        }}
        className={cn("grid size-11 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-text/10 hover:text-text", triggerClassName)}
      >
        <Icon aria-hidden className="size-5" />
      </button>
      {open && (
        <ul
          role="menu"
          aria-label={label}
          className={cn("absolute right-0 z-30 w-56 rounded-2xl bg-elevated p-1.5 shadow-xl ring-1 ring-line-strong", up ? "bottom-full mb-1" : "top-full mt-1")}
        >
          {items.map(({ label: text, icon: ItemIcon, danger, run }) => (
            <li key={text} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close(false)
                  run()
                }}
                className={cn(
                  "flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-bold transition-colors duration-150 hover:bg-text/10 focus-visible:bg-text/10",
                  danger ? "text-danger-text" : "text-text",
                )}
              >
                <ItemIcon aria-hidden className="size-5" />
                {text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
