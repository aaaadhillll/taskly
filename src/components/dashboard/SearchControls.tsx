import { Search, X } from "lucide-react"
import { useUi } from "@/hooks/useUi"
import type { PriorityFilter, SortKey } from "@/types/task"
import { IconButton } from "@/components/ui/Button"
import { SelectInput, inputClass } from "@/components/ui/Field"

/** Search, sort and priority filter: the three controls for narrowing the task list. */
export function SearchControls() {
  const { query, setQuery, sort, setSort, priority, setPriority } = useUi()
  return (
    <div className="grid gap-3">
      <div role="search" className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          id="task-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
          autoComplete="off"
          className={`${inputClass} bg-surface pl-14 pr-14 [&::-webkit-search-cancel-button]:hidden`}
        />
        {query && (
          <IconButton label="Clear search" className="absolute right-1.5 top-1.5 size-11 bg-transparent" onClick={() => setQuery("")}>
            <X aria-hidden className="size-5" />
          </IconButton>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectInput aria-label="Sort tasks" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-surface text-[15px] font-bold">
          <option value="smart">Sort: Default</option>
          <option value="priority">Sort: Priority</option>
          <option value="newest">Sort: Newest</option>
          <option value="title">Sort: A to Z</option>
        </SelectInput>
        <SelectInput aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value as PriorityFilter)} className="bg-surface text-[15px] font-bold">
          <option value="all">Priority: Any</option>
          <option value="high">Priority: High</option>
          <option value="medium">Priority: Medium</option>
          <option value="low">Priority: Low</option>
        </SelectInput>
      </div>
    </div>
  )
}
