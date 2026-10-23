import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/utils/cn"

interface ModalProps {
  open: boolean
  onClose: () => void
  /** id of the element that names the dialog */
  labelledBy: string
  /** "sheet" fills the screen on phones and is a large centred panel from md up; "small" is a compact confirm box */
  size?: "sheet" | "small"
  children: ReactNode
}

/**
 * A native modal <dialog>: the browser supplies the focus trap, Escape and inert page behind it.
 * Children only mount while open, so a form inside starts fresh every time.
 */
export function Modal({ open, onClose, labelledBy, size = "sheet", children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const pressedBackdrop = useRef(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // showModal focuses the first control; a form asks for a better one with data-autofocus
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      // Close on a click in the dim area, but only if the press started there too, so dragging a
      // text selection out of a field doesn't dismiss the dialog
      onPointerDown={(e) => (pressedBackdrop.current = e.target === e.currentTarget)}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) onClose()
      }}
      className={cn(
        "max-h-none max-w-none p-0 text-text backdrop:bg-black/65 open:animate-modal",
        size === "sheet"
          ? "fixed inset-0 m-0 h-dvh w-screen overflow-y-auto rounded-none bg-canvas md:m-auto md:bg-surface md:h-auto md:max-h-[92dvh] md:w-full md:max-w-xl md:rounded-4xl md:ring-1 md:ring-line-strong"
          : "m-auto w-[calc(100%-2.5rem)] max-w-md rounded-4xl bg-surface",
      )}
    >
      {open ? children : null}
    </dialog>
  )
}
