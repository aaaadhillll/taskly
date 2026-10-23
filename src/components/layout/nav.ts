import { CalendarDays, ChartNoAxesColumn, House, LayoutGrid, Settings, type LucideIcon } from "lucide-react"
import { links, type Route } from "@/hooks/useRoute"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Whether this item owns the current route (Categories also owns its per-category pages) */
  active: (route: Route) => boolean
  /** Phones have room for four items; Categories lives under Home's filters and Settings there */
  phone: boolean
}

export const NAV: readonly NavItem[] = [
  { label: "Home", href: links.home, icon: House, active: (r) => r.name === "home" || r.name === "tasks" || r.name === "task", phone: true },
  { label: "Calendar", href: links.calendar, icon: CalendarDays, active: (r) => r.name === "calendar", phone: true },
  { label: "Stats", href: links.stats, icon: ChartNoAxesColumn, active: (r) => r.name === "stats", phone: true },
  { label: "Categories", href: links.categories, icon: LayoutGrid, active: (r) => r.name === "categories" || r.name === "category", phone: false },
  { label: "Settings", href: links.settings, icon: Settings, active: (r) => r.name === "settings", phone: true },
]
