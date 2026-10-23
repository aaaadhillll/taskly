import { useEffect, useRef, type ReactNode } from "react"
import { links, navigate, type Route } from "@/hooks/useRoute"
import { useUi } from "@/hooks/useUi"
import { DeleteTaskDialog } from "@/components/tasks/DeleteTaskDialog"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { AddTaskButton } from "./AddTaskButton"
import { BottomNav } from "./BottomNav"
import { Sidebar } from "./Sidebar"

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

export function AppShell({ route, children }: { route: Route; children: ReactNode }) {
  const { openForm, setSearchOpen, selectedDate } = useUi()
  const main = useRef<HTMLElement>(null)

  // Moving to a new screen starts at its top, with focus on it (so a screen reader announces the change)
  useEffect(() => {
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [route])

  // Keyboard shortcuts, listed under Settings > Help. Ignored while typing or with a modifier held.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target) || document.querySelector("dialog[open]")) return
      if (event.key === "n") {
        event.preventDefault()
        openForm({ dueDate: selectedDate })
      } else if (event.key === "/") {
        event.preventDefault()
        if (route.name !== "home") navigate(links.home)
        setSearchOpen(true)
        // The field mounts on the next paint when it was closed
        requestAnimationFrame(() => document.getElementById("task-search")?.focus())
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openForm, setSearchOpen, selectedDate, route.name])

  // The welcome screen stands alone: no rail, no bar, no shortcuts
  if (route.name === "welcome") {
    return (
      <main id="main" ref={main} tabIndex={-1} className="outline-none">
        {children}
      </main>
    )
  }

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          main.current?.focus()
        }}
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-2xl bg-accent px-5 py-3 font-extrabold text-accent-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar route={route} />
      <main
        id="main"
        ref={main}
        tabIndex={-1}
        className="mx-auto flex min-h-dvh w-full max-w-[112rem] flex-col px-5 pb-36 pt-6 outline-none sm:px-8 md:pt-12 lg:pb-24 lg:pl-[calc(6rem+3rem)] lg:pr-12 lg:pt-14"
      >
        {children}
      </main>
      <BottomNav route={route} />
      {/* Phones: the floating +, on the screens where adding a task makes sense */}
      {(route.name === "home" || route.name === "tasks" || route.name === "category") && <AddTaskButton route={route} variant="float" />}
      <TaskFormDialog />
      <DeleteTaskDialog />
    </>
  )
}
