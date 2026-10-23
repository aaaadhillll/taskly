import { useMemo, useSyncExternalStore } from "react"
import { isCategoryId } from "@/data/categories"
import type { CategoryId } from "@/types/task"

export type Route =
  | { name: "welcome" }
  | { name: "home" }
  | { name: "tasks" }
  | { name: "calendar" }
  | { name: "stats" }
  | { name: "categories" }
  | { name: "category"; id: CategoryId }
  | { name: "settings" }
  | { name: "task"; id: string }

// Real paths: shareable, linkable and bookmarkable like any URL. vercel.json rewrites every path
// to index.html, since there's no server to route them to otherwise.
export const links = {
  welcome: "/welcome",
  home: "/",
  tasks: "/tasks",
  calendar: "/calendar",
  stats: "/stats",
  categories: "/categories",
  category: (id: CategoryId) => `/categories/${id}`,
  settings: "/settings",
  task: (id: string) => `/task/${encodeURIComponent(id)}`,
} as const

function parse(pathname: string): Route {
  const [first, second] = pathname.replace(/^\/|\/$/g, "").split("/")
  if (first === "welcome") return { name: "welcome" }
  if (first === "tasks") return { name: "tasks" }
  if (first === "calendar") return { name: "calendar" }
  if (first === "stats") return { name: "stats" }
  if (first === "settings") return { name: "settings" }
  if (first === "categories") return isCategoryId(second) ? { name: "category", id: second } : { name: "categories" }
  if (first === "task" && second) return { name: "task", id: decodeURIComponent(second) }
  return { name: "home" }
}

// pushState doesn't fire popstate (only Back/Forward do), so navigate() dispatches its own event;
// useRoute listens for both.
const NAV_EVENT = "taskly:navigate"

const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify)
  window.addEventListener(NAV_EVENT, notify)
  return () => {
    window.removeEventListener("popstate", notify)
    window.removeEventListener(NAV_EVENT, notify)
  }
}

export function useRoute(): Route {
  const pathname = useSyncExternalStore(subscribe, () => location.pathname)
  return useMemo(() => parse(pathname), [pathname])
}

export const navigate = (to: string) => {
  if (location.pathname !== to) history.pushState(null, "", to)
  window.dispatchEvent(new Event(NAV_EVENT))
}

// Counts in-app navigations so "Back" can go back when there is somewhere in the app to go back to,
// and fall back to a fixed screen after a deep link (history.back() would leave the app).
let appNavigations = 0
window.addEventListener(NAV_EVENT, () => appNavigations++)
window.addEventListener("popstate", () => appNavigations++)

export const goBack = (fallback: string) => (appNavigations > 0 ? history.back() : navigate(fallback))

// Every in-app link is a plain <a href={links.x}> (no router component, no per-link onClick —
// same "let the browser do it" approach the hash router used). One delegated listener intercepts
// same-origin, unmodified clicks so they push state instead of reloading the page; external
// links, new-tab/download links and modified clicks (ctrl/cmd/shift/middle-click) are left alone.
window.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const anchor = (e.target as HTMLElement).closest("a")
  if (!anchor || anchor.target || anchor.hasAttribute("download")) return
  const url = new URL(anchor.href, location.href)
  if (url.origin !== location.origin || url.hash) return
  e.preventDefault()
  navigate(url.pathname + url.search)
})
