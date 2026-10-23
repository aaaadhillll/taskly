import { useEffect, useState } from "react"

/**
 * State mirrored to localStorage. `parse` validates what was stored (return undefined to reject it
 * and use the fallback). Storage that is full or blocked degrades to plain in-memory state.
 */
export function useLocalStorage<T>(key: string, fallback: () => T, parse: (raw: unknown) => T | undefined) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        const parsed = parse(JSON.parse(raw))
        if (parsed !== undefined) return parsed
      }
    } catch {
      // Unreadable or blocked: start from the fallback
    }
    return fallback()
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked: keep working for this session
    }
  }, [key, value])

  return [value, setValue] as const
}
