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

// Hash routes: Back works, every screen is linkable, and no server rewrite rules are needed
export const links = {
  welcome: "#/welcome",
  home: "#/",
  tasks: "#/tasks",
  calendar: "#/calendar",
  stats: "#/stats",
  categories: "#/categories",
  category: (id: CategoryId) => `#/categories/${id}`,
  settings: "#/settings",
  task: (id: string) => `#/task/${encodeURIComponent(id)}`,
} as const

function parse(hash: string): Route {
  const [first, second] = hash.replace(/^#\/?/, "").split("/")
  if (first === "welcome") return { name: "welcome" }
  if (first === "tasks") return { name: "tasks" }
  if (first === "calendar") return { name: "calendar" }
  if (first === "stats") return { name: "stats" }
  if (first === "settings") return { name: "settings" }
  if (first === "categories") return isCategoryId(second) ? { name: "category", id: second } : { name: "categories" }
  if (first === "task" && second) return { name: "task", id: decodeURIComponent(second) }
  return { name: "home" }
}

const subscribe = (notify: () => void) => {
  window.addEventListener("hashchange", notify)
  return () => window.removeEventListener("hashchange", notify)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash)
  return useMemo(() => parse(hash), [hash])
}

export const navigate = (to: string) => {
  location.hash = to
}

// Counts in-app navigations so "Back" can go back when there is somewhere in the app to go back to,
// and fall back to a fixed screen after a deep link (history.back() would leave the app).
let appNavigations = 0
window.addEventListener("hashchange", () => appNavigations++)

export const goBack = (fallback: string) => (appNavigations > 0 ? history.back() : navigate(fallback))
