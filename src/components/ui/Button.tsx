import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/utils/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-soft" | "solid"
type Size = "sm" | "md" | "lg" | "xl"

const VARIANTS: Record<Variant, string> = {
  // The lime call to action. Light mode gets its hairline edge from the global .bg-accent rule.
  primary: "bg-accent text-accent-ink hover:brightness-[1.04] active:brightness-90",
  // A raised chip: white with an edge on a light page, a lifted dark grey on a dark one
  secondary: "bg-btn text-text ring-1 ring-inset ring-edge hover:bg-btn-hover active:brightness-95",
  ghost: "text-text hover:bg-text/10 active:bg-text/15",
  danger: "bg-danger text-accent-ink hover:brightness-105 active:brightness-90",
  "danger-soft": "bg-danger/12 text-danger-text ring-1 ring-inset ring-danger/35 hover:bg-danger/20 active:brightness-95",
  // The main action on a card: black on a light page, lime on a dark one
  solid: "bg-solid text-on-solid hover:brightness-105 active:brightness-90",
}

const SIZES: Record<Size, string> = {
  sm: "h-11 gap-2 rounded-xl px-4 text-sm",
  md: "h-12 gap-2 rounded-2xl px-5 text-[15px]",
  lg: "h-14 gap-3 rounded-2xl px-6 text-base",
  xl: "h-14 gap-3 rounded-2xl px-6 text-[15px] md:h-[4.5rem] md:rounded-3xl md:px-8 md:text-sm md:uppercase md:tracking-[0.1em]",
}

/** Class names for anything that should look like a button (a link, for instance). */
export const buttonClass = (variant: Variant = "primary", size: Size = "lg", extra?: string) =>
  cn(
    "inline-flex select-none items-center justify-center font-extrabold transition duration-150 disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    extra,
  )

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}

/** Round icon-only button. The label is required: there is no visible text to name it. */
export function IconButton({
  label,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full bg-btn text-text ring-1 ring-inset ring-edge transition duration-150 hover:bg-btn-hover active:brightness-95",
        className,
      )}
      {...props}
    />
  )
}
