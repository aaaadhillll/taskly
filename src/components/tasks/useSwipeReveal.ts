import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from "react"

const OPEN_EVENT = "taskly:swipe-open"

/**
 * Swipe a row from right to left to reveal a tray of actions behind it, like a chat list. Touch and
 * pen only (a mouse keeps its normal click and drag). The row snaps open past a third of the tray or
 * springs back, only one row is open at a time, and it closes on a tap elsewhere or a scroll.
 *
 * The row element needs `touch-action: pan-y` so the browser keeps vertical scrolling and hands the
 * horizontal moves to us.
 */
export function useSwipeReveal(width: number, enabled: boolean, id: string, container: RefObject<HTMLElement | null>) {
  const [offset, setOffset] = useState(0) // 0 = closed, -width = open
  const [dragging, setDragging] = useState(false)
  const open = offset <= -width
  const drag = useRef<{ x: number; y: number; base: number } | null>(null)
  const axis = useRef<"x" | null>(null)
  const swallowClick = useRef(false)

  const close = useCallback(() => setOffset(0), [])

  // Only one row open at a time, and away from the row (tap, scroll) closes it
  useEffect(() => {
    if (!open) return
    const others = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) close()
    }
    const away = (e: globalThis.PointerEvent) => {
      if (!container.current?.contains(e.target as Node)) close()
    }
    window.addEventListener(OPEN_EVENT, others)
    document.addEventListener("pointerdown", away)
    window.addEventListener("scroll", close, { passive: true })
    return () => {
      window.removeEventListener(OPEN_EVENT, others)
      document.removeEventListener("pointerdown", away)
      window.removeEventListener("scroll", close)
    }
  }, [open, id, close, container])

  const onPointerDown = (e: PointerEvent) => {
    if (!enabled || e.pointerType === "mouse" || !e.isPrimary) return
    drag.current = { x: e.clientX, y: e.clientY, base: offset }
    axis.current = null
  }

  const onPointerMove = (e: PointerEvent) => {
    const start = drag.current
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (!axis.current) {
      if (Math.abs(dy) > 8) drag.current = null // a vertical move is a scroll
      else if (Math.abs(dx) > 8) {
        axis.current = "x"
        setDragging(true)
        e.currentTarget.setPointerCapture(e.pointerId)
      }
      return
    }
    // A little give past the ends, so it feels elastic
    setOffset(Math.min(12, Math.max(-width - 20, start.base + dx)))
  }

  const finish = () => {
    if (axis.current === "x") {
      swallowClick.current = true // the click that ends a drag must not open the task
      setTimeout(() => (swallowClick.current = false), 0)
      const opens = offset < -width / 3
      setOffset(opens ? -width : 0)
      if (opens) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }))
      setDragging(false)
    }
    drag.current = null
    axis.current = null
  }

  /** Put this on the row's click capture: a drag, or a tap on an open row, must not activate what is under it. */
  const onClickCapture = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    if (swallowClick.current || open) {
      e.preventDefault()
      e.stopPropagation()
      if (open && !swallowClick.current) close()
    }
  }

  return { offset, dragging, open, close, bind: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onClickCapture } }
}
