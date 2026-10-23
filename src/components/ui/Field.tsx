import { ChevronDown } from "lucide-react"
import type { SelectHTMLAttributes } from "react"
import { cn } from "@/utils/cn"

/** Large, calm inputs: 56px tall with 17px text (16px+ also stops iOS zooming in on focus). */
export const inputClass =
  "h-14 w-full rounded-2xl bg-elevated px-5 text-[17px] font-medium text-text placeholder:text-muted aria-invalid:outline-2 aria-invalid:outline-danger"

/** A native select (so it works everywhere) with its own chevron. */
export function SelectInput({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputClass, "cursor-pointer appearance-none pr-12", className)}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
    </div>
  )
}
