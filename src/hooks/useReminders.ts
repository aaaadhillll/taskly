import { useEffect, useRef } from "react"
import type { Task } from "@/types/task"
import { formatTime, todayKey } from "@/utils/date"

const WINDOW_MS = 5 * 60 * 1000

/**
 * Shows a browser notification when a task's due time arrives. It only fires while the app is open in
 * a tab (there is no server or service worker to wake it), and only within a few minutes of the due
 * time, so reopening the app later doesn't replay the whole day.
 */
export function useReminders(enabled: boolean, tasks: Task[]) {
  const tasksRef = useRef(tasks)
  const notified = useRef(new Set<string>())

  useEffect(() => {
    tasksRef.current = tasks
  })

  useEffect(() => {
    if (!enabled || typeof Notification === "undefined" || Notification.permission !== "granted") return
    const check = () => {
      const now = Date.now()
      const today = todayKey()
      for (const t of tasksRef.current) {
        if (t.completed || !t.dueTime || t.dueDate !== today || notified.current.has(t.id)) continue
        const due = new Date(`${t.dueDate}T${t.dueTime}`).getTime()
        if (now >= due && now - due < WINDOW_MS) {
          notified.current.add(t.id)
          new Notification(t.title, { body: `Due at ${formatTime(t.dueTime)}` })
        }
      }
    }
    check()
    const id = setInterval(check, 15_000)
    return () => clearInterval(id)
  }, [enabled])
}
