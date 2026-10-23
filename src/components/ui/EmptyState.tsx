import type { ReactNode } from "react"

/** A calm, typographic empty state. Never a blank hole in the page. */
export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-44 flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line px-6 py-8 text-center md:rounded-4xl md:py-14">
      <p className="text-task">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-base font-medium text-muted md:text-[17px]">{message}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
