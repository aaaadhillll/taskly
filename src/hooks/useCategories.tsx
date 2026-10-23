import { createContext, use, useCallback, useEffect, useMemo, type ReactNode } from "react"
import {
  CATEGORIES, CUSTOM_ICONS, CUSTOM_PALETTES, updateAllCategories,
  type CategoryInfo, type PaletteId,
} from "@/data/categories"
import { Star } from "lucide-react"
import { newId } from "@/utils/id"
import { useLocalStorage } from "./useLocalStorage"

export interface CustomCategory {
  id: string
  label: string
  paletteId: PaletteId
  iconName: string
}

interface CategoriesApi {
  customCategories: CustomCategory[]
  allCategories: readonly CategoryInfo[]
  addCategory: (label: string, paletteId: PaletteId, iconName: string) => void
  removeCategory: (id: string) => void
}

const CategoriesContext = createContext<CategoriesApi | null>(null)

const parseCustom = (raw: unknown): CustomCategory[] | undefined => {
  if (!Array.isArray(raw)) return undefined
  return raw.filter(
    (x): x is CustomCategory =>
      x != null &&
      typeof x.id === "string" &&
      typeof x.label === "string" &&
      typeof x.paletteId === "string" &&
      typeof x.iconName === "string",
  )
}

const toInfo = (c: CustomCategory): CategoryInfo => {
  const palette = CUSTOM_PALETTES.find((p) => p.id === c.paletteId) ?? CUSTOM_PALETTES[0]!
  return {
    id: c.id,
    label: c.label,
    icon: CUSTOM_ICONS[c.iconName] ?? Star,
    tint: palette.tint,
    dot: palette.dot,
  }
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [customCategories, setCustom] = useLocalStorage<CustomCategory[]>(
    "taskly.categories.v1",
    () => [],
    parseCustom,
  )

  const allCategories = useMemo<readonly CategoryInfo[]>(
    () => [...CATEGORIES, ...customCategories.map(toInfo)],
    [customCategories],
  )

  // Keep the module-level registry in sync so categoryInfo() works everywhere synchronously
  useEffect(() => { updateAllCategories(allCategories) }, [allCategories])

  const addCategory = useCallback((label: string, paletteId: PaletteId, iconName: string) => {
    setCustom((prev) => [...prev, { id: `cat_${newId()}`, label: label.trim(), paletteId, iconName }])
  }, [setCustom])

  const removeCategory = useCallback((id: string) => {
    setCustom((prev) => prev.filter((c) => c.id !== id))
  }, [setCustom])

  const api = useMemo(
    () => ({ customCategories, allCategories, addCategory, removeCategory }),
    [customCategories, allCategories, addCategory, removeCategory],
  )

  return <CategoriesContext value={api}>{children}</CategoriesContext>
}

export function useCategories(): CategoriesApi {
  const ctx = use(CategoriesContext)
  if (!ctx) throw new Error("useCategories must be used inside <CategoriesProvider>")
  return ctx
}
