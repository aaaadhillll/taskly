// Days are local calendar dates as YYYY-MM-DD strings. They sort correctly as plain text, and
// avoid the off-by-one-day bugs that toISOString() (UTC) causes near midnight.

export const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export const parseKey = (key: string): Date => {
  const [y = 1970, m = 1, d = 1] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = (): string => dateKey(new Date())

export const isDateKey = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

/** Adds months, clamping to the end of a shorter month (Jan 31 + 1 month is Feb 28, not Mar 3). */
export function addMonths(key: string, n: number): string {
  const d = parseKey(key)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
  return dateKey(d)
}

export const startOfMonth = (key: string): string => `${key.slice(0, 8)}01`
export const daysInMonth = (key: string): number => {
  const d = parseKey(key)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/** Monday of the week containing the day */
export const startOfWeek = (key: string): string => addDays(key, -((parseKey(key).getDay() + 6) % 7))

export const diffDays = (a: string, b: string): number => Math.round((parseKey(a).getTime() - parseKey(b).getTime()) / 864e5)

export const formatDate = (key: string, options: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(undefined, options).format(parseKey(key))

/** "18:00" becomes "6:00 PM" (or "18:00" in a 24-hour locale) */
export const formatTime = (time: string): string =>
  new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })

/** "Today", "Tomorrow", "Yesterday", otherwise "Wed, Sep 30" */
export function relativeDay(key: string, today: string): string {
  const diff = diffDays(key, today)
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff === -1) return "Yesterday"
  return formatDate(key, { weekday: "short", month: "short", day: "numeric" })
}

/** Local day of an ISO timestamp */
export const dayOf = (iso: string): string => dateKey(new Date(iso))

export const greeting = (hour = new Date().getHours()): string =>
  hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
