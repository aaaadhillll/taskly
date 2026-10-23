import { Plus } from "lucide-react"
import type { Route } from "@/hooks/useRoute"
import { useUi } from "@/hooks/useUi"
import { cn } from "@/utils/cn"

/**
 * The lime "+". On phones it floats bottom-right above the bar, as in the reference; on desktop it
 * is the first item of the side rail, so it never covers the content there.
 */
export function AddTaskButton({ route, variant }: { route: Route; variant: "float" | "rail" }) {
  const { openForm, selectedDate } = useUi()
  return (
    <button
      type="button"
      aria-label="New task"
      onClick={() => openForm({ dueDate: selectedDate, category: route.name === "category" ? route.id : undefined })}
      className={cn(
        "bg-accent text-accent-ink transition duration-150 hover:brightness-105 active:brightness-90",
        variant === "float"
          ? "fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-5 z-30 grid size-14 place-items-center rounded-full shadow-lg shadow-black/30 lg:hidden"
          : "flex w-[4.5rem] flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-extrabold",
      )}
    >
      <Plus aria-hidden className={variant === "float" ? "size-7" : "size-6"} strokeWidth={2.75} />
      {variant === "rail" && "New"}
    </button>
  )
}
