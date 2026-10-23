import {
  BookOpen, Briefcase, Camera, Code2, Coffee, Dumbbell, Flame, Globe,
  Heart, House, Leaf, Music, Plane, ShoppingBag, Star, Target, Zap,
  type LucideIcon,
} from "lucide-react"
import type { CategoryId } from "@/types/task"

export interface CategoryInfo {
  id: CategoryId
  label: string
  icon: LucideIcon
  /** Soft chip: pastel on a light page, a translucent tint on a dark one (text colour included) */
  tint: string
  /** A small solid dot beside the name in pickers */
  dot: string
}

export const CATEGORIES: readonly CategoryInfo[] = [
  { id: "personal", label: "Personal", icon: House,     tint: "bg-[#e3f3c9] text-[#1f3d0f] dark:bg-[#57d977]/20 dark:text-[#a9efbb]", dot: "bg-[#57d977]" },
  { id: "work",     label: "Work",     icon: Briefcase, tint: "bg-[#dce6ff] text-[#14295e] dark:bg-[#6c9bff]/20 dark:text-[#b9cfff]", dot: "bg-[#6c9bff]" },
  { id: "gym",      label: "Gym",      icon: Dumbbell,  tint: "bg-[#ffe4d2] text-[#5e2a08] dark:bg-[#ff9a55]/20 dark:text-[#ffc9a0]", dot: "bg-[#ff9a55]" },
  { id: "study",    label: "Study",    icon: BookOpen,  tint: "bg-[#e7e0ff] text-[#2f1d6b] dark:bg-[#a48bff]/22 dark:text-[#d2c8ff]", dot: "bg-[#a48bff]" },
  { id: "travel",   label: "Travel",   icon: Plane,     tint: "bg-[#d3f1f6] text-[#0b3a44] dark:bg-[#4fd0e0]/20 dark:text-[#a7eef6]", dot: "bg-[#4fd0e0]" },
]

/** Fixed colour slots for custom categories — all classes are static so Tailwind JIT picks them up. */
export const CUSTOM_PALETTES = [
  { id: "rose",   tint: "bg-[#ffe0e0] text-[#5e0d0d] dark:bg-[#ff6b6b]/20 dark:text-[#ffb3b3]", dot: "bg-[#ff6b6b]" },
  { id: "amber",  tint: "bg-[#fff3d2] text-[#4d3400] dark:bg-[#ffcc44]/20 dark:text-[#ffdf8a]", dot: "bg-[#ffcc44]" },
  { id: "lime",   tint: "bg-[#e3f3c9] text-[#1f3d0f] dark:bg-[#57d977]/20 dark:text-[#a9efbb]", dot: "bg-[#57d977]" },
  { id: "sky",    tint: "bg-[#dce6ff] text-[#14295e] dark:bg-[#6c9bff]/20 dark:text-[#b9cfff]", dot: "bg-[#6c9bff]" },
  { id: "purple", tint: "bg-[#e7e0ff] text-[#2f1d6b] dark:bg-[#a48bff]/22 dark:text-[#d2c8ff]", dot: "bg-[#a48bff]" },
  { id: "teal",   tint: "bg-[#d3f1f6] text-[#0b3a44] dark:bg-[#4fd0e0]/20 dark:text-[#a7eef6]", dot: "bg-[#4fd0e0]" },
  { id: "pink",   tint: "bg-[#fce0f0] text-[#5e0d35] dark:bg-[#f472b6]/20 dark:text-[#f9a8d4]", dot: "bg-[#f472b6]" },
  { id: "orange", tint: "bg-[#ffe4d2] text-[#5e2a08] dark:bg-[#ff9a55]/20 dark:text-[#ffc9a0]", dot: "bg-[#ff9a55]" },
] as const

export type PaletteId = (typeof CUSTOM_PALETTES)[number]["id"]

/** Icons available when creating a custom category. */
export const CUSTOM_ICONS: Record<string, LucideIcon> = {
  star: Star, heart: Heart, coffee: Coffee, music: Music,
  shopping: ShoppingBag, camera: Camera, code: Code2, target: Target,
  flame: Flame, leaf: Leaf, zap: Zap, globe: Globe,
}

export const CUSTOM_ICON_LIST = Object.keys(CUSTOM_ICONS)

// Module-level registry — starts with built-ins; CategoriesProvider expands it with custom ones.
// All existing categoryInfo() calls automatically see custom categories once the provider runs.
let _all: readonly CategoryInfo[] = CATEGORIES

export const updateAllCategories = (next: readonly CategoryInfo[]) => { _all = next }

export const categoryInfo = (id: string): CategoryInfo => _all.find((c) => c.id === id) ?? _all[0]!

// Any non-empty string is a plausible category ID — custom IDs are validated by the provider
export const isCategoryId = (value: unknown): value is CategoryId =>
  typeof value === "string" && value.length > 0
