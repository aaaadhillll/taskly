import type { CategoryId, Priority, Repeat, Subtask, Task } from "@/types/task"
import { addDays, parseKey } from "@/utils/date"
import { newId } from "@/utils/id"

const at = (day: string, time: string): string => {
  const d = parseKey(day)
  const [h = 0, m = 0] = time.split(":").map(Number)
  d.setHours(h, m)
  return d.toISOString()
}

const steps = (...items: [string, boolean?][]): Subtask[] => items.map(([title, done]) => ({ id: newId(), title, done: done ?? false }))

interface Seed {
  title: string
  category: CategoryId
  day: string
  time?: string
  priority?: Priority
  description?: string
  tags?: string[]
  repeat?: Repeat
  subtasks?: Subtask[]
  /** Local HH:mm it was ticked off on its day; leave out for an open task */
  doneAt?: string
}

function make(seed: Seed): Task {
  const created = at(addDays(seed.day, -2), "09:00")
  const completedAt = seed.doneAt ? at(seed.day, seed.doneAt) : null
  return {
    id: newId(),
    title: seed.title,
    description: seed.description ?? "",
    completed: completedAt !== null,
    priority: seed.priority ?? "medium",
    category: seed.category,
    tags: seed.tags ?? [],
    dueDate: seed.day,
    dueTime: seed.time ?? "",
    repeat: seed.repeat ?? "none",
    subtasks: seed.subtasks ?? [],
    createdAt: created,
    updatedAt: completedAt ?? created,
    completedAt,
  }
}

/**
 * A believable week around `today`: a day that is 3 of 5 done, work lined up for
 * the days ahead and two weeks of finished tasks, so the calendar, stats and streak all have
 * something to show on first run.
 */
export function createSampleTasks(today: string): Task[] {
  const d = (n: number) => addDays(today, n)

  const current: Seed[] = [
    // Today: 3 of 5 done, one started (2 of its 4 steps), one untouched
    { title: "Morning workout", category: "gym", day: d(0), time: "07:00", priority: "low", description: "Legs and core, 45 minutes.", repeat: "daily", doneAt: "07:40" },
    { title: "Reply to client emails", category: "work", day: d(0), time: "09:00", doneAt: "09:30" },
    {
      title: "Finish project UI",
      category: "work",
      day: d(0),
      time: "10:00",
      priority: "high",
      description: "Complete the homepage and responsive layouts for the new app.",
      tags: ["UI", "Design"],
      subtasks: steps(["Design hero section", true], ["Implement responsive layout", true], ["Add animations"], ["Review and test on mobile"]),
    },
    { title: "Read 20 pages", category: "personal", day: d(0), time: "14:00", priority: "low", description: "Continue the design systems book.", tags: ["reading"], repeat: "daily", doneAt: "14:30" },
    { title: "Grocery shopping", category: "personal", day: d(0), time: "16:00", description: "Weekly run. Check the pantry first." },

    { title: "Morning workout", category: "gym", day: d(1), time: "07:00", priority: "low", description: "Legs and core, 45 minutes.", repeat: "daily" },
    { title: "Read 20 pages", category: "personal", day: d(1), time: "14:00", priority: "low", repeat: "daily" },
    { title: "Team meeting", category: "work", day: d(1), time: "14:00", description: "Weekly planning with the team." },
    {
      title: "Finish portfolio design",
      category: "work",
      day: d(1),
      time: "18:00",
      priority: "high",
      description: "Polish the case study layouts, export the final assets and write the project summary.",
      tags: ["design", "portfolio"],
      subtasks: steps(["Finalise case study layouts"], ["Export image assets"], ["Write project summary"]),
    },
    { title: "Book flight tickets", category: "travel", day: d(2), time: "09:00", description: "Compare fares for the Kochi trip.", tags: ["trip"] },
    { title: "Pay electricity bill", category: "personal", day: d(3), priority: "low" },
    { title: "Design systems course: module 3", category: "study", day: d(4), time: "19:00", tags: ["course"] },
    {
      title: "Pack for the Kochi trip",
      category: "travel",
      day: d(6),
      time: "08:00",
      priority: "high",
      tags: ["trip"],
      subtasks: steps(["Passport and tickets"], ["Chargers and adapters"], ["Clothes"]),
    },
    { title: "Plan next month's budget", category: "personal", day: d(8), priority: "low" },
  ]

  // [days ago, time, title, category, priority]
  const history: [number, string, string, CategoryId, Priority][] = [
    [1, "10:00", "Weekly review", "work", "medium"],
    [1, "18:30", "Evening run", "gym", "medium"],
    [2, "11:00", "Submit expense report", "work", "high"],
    [2, "17:00", "Meal prep", "personal", "low"],
    [2, "21:00", "Read 20 pages", "study", "low"],
    [3, "06:30", "Morning workout", "gym", "medium"],
    [3, "15:00", "Plan sprint tasks", "work", "medium"],
    [5, "12:00", "Renew gym membership", "gym", "low"],
    [5, "16:00", "Update resume", "work", "medium"],
    [6, "06:30", "Morning workout", "gym", "medium"],
    [6, "21:00", "Read 20 pages", "study", "low"],
    [8, "10:00", "Clean the desk", "personal", "low"],
    [8, "19:00", "Study session: Go basics", "study", "medium"],
    [9, "14:00", "Client call", "work", "high"],
    [11, "12:30", "Grocery shopping", "personal", "low"],
    [13, "06:30", "Morning workout", "gym", "medium"],
  ]
  const past = history.map(([ago, time, title, category, priority]) =>
    make({ title, category, priority, day: d(-ago), time, doneAt: time }),
  )

  return [...current.map(make), ...past]
}
