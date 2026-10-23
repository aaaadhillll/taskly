import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react"
import type { CategoryId, PriorityFilter, SortKey, StatusTab, Task } from "@/types/task"
import { todayKey } from "@/utils/date"

export interface FormRequest {
  /** The task being edited, or undefined when creating */
  task?: Task
  /** Day to pre-fill when creating */
  dueDate?: string
  /** Category to pre-fill when creating */
  category?: CategoryId
}

interface UiApi {
  // Dashboard view state lives here, not in the page, so Back from a task returns to the same view
  selectedDate: string
  setSelectedDate: (day: string) => void
  tab: StatusTab
  setTab: (tab: StatusTab) => void
  category: CategoryId | "all"
  setCategory: (category: CategoryId | "all") => void
  query: string
  setQuery: (query: string) => void
  sort: SortKey
  setSort: (sort: SortKey) => void
  priority: PriorityFilter
  setPriority: (priority: PriorityFilter) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  /** The create/edit dialog: null while closed */
  form: FormRequest | null
  openForm: (request?: FormRequest) => void
  closeForm: () => void

  /** The task waiting on a "delete this?" confirmation, or null */
  deleteRequest: Task | null
  requestDelete: (task: Task | null) => void
}

const UiContext = createContext<UiApi | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [tab, setTab] = useState<StatusTab>("today")
  const [category, setCategory] = useState<CategoryId | "all">("all")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("smart")
  const [priority, setPriority] = useState<PriorityFilter>("all")
  const [searchOpen, setSearchOpen] = useState(false)
  const [form, setForm] = useState<FormRequest | null>(null)
  const [deleteRequest, requestDelete] = useState<Task | null>(null)

  const openForm = useCallback((request: FormRequest = {}) => setForm(request), [])
  const closeForm = useCallback(() => setForm(null), [])

  const api = useMemo(
    () => ({ selectedDate, setSelectedDate, tab, setTab, category, setCategory, query, setQuery, sort, setSort, priority, setPriority, searchOpen, setSearchOpen, form, openForm, closeForm, deleteRequest, requestDelete }),
    [selectedDate, tab, category, query, sort, priority, searchOpen, form, openForm, closeForm, deleteRequest],
  )
  return <UiContext value={api}>{children}</UiContext>
}

export function useUi(): UiApi {
  const ctx = use(UiContext)
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>")
  return ctx
}
