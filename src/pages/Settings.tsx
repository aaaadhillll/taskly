import { Bell, ChevronRight, CircleHelp, Database, Download, Info, Palette, RotateCcw, Trash2, Upload } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import { links } from "@/hooks/useRoute"
import { useSettings, type ThemePref } from "@/hooks/useSettings"
import { useTasks } from "@/hooks/useTasks"
import { parseTasks } from "@/utils/parse"
import { Button } from "@/components/ui/Button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { inputClass } from "@/components/ui/Field"
import { SegmentedTabs } from "@/components/ui/SegmentedTabs"
import { Toggle } from "@/components/ui/Toggle"

const THEMES: { value: ThemePref; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
]
const THEME_NAME: Record<ThemePref, string> = { dark: "Dark", light: "Light", system: "System" }

const kb = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`)
const summaryClass =
  "flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-xl [&::-webkit-details-marker]:hidden has-[:focus-visible]:outline-3 focus-visible:outline-3 focus-visible:outline-offset-[-2px]"

/** A settings row that opens in place: icon, name, its current value and a chevron that turns. */
function Row({ icon: Icon, label, value, children }: { icon: typeof Bell; label: string; value?: string; children: ReactNode }) {
  return (
    <details className="group border-t border-line first:border-t-0">
      <summary className={summaryClass}>
        <Icon aria-hidden className="size-5 shrink-0 text-muted" />
        <span className="min-w-0 flex-1 text-[15px] font-semibold">{label}</span>
        <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted">
          {value}
          <ChevronRight aria-hidden className="size-4 transition-transform duration-150 group-open:rotate-90" />
        </span>
      </summary>
      <div className="pb-4 pl-8">{children}</div>
    </details>
  )
}

export function SettingsPage() {
  const { name, setName, theme, setTheme, reminders, setReminders } = useSettings()
  const { tasks, merge, resetToSample, clear } = useTasks()
  const [confirm, setConfirm] = useState<"reset" | "clear" | null>(null)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const supported = typeof Notification !== "undefined"
  const [permission, setPermission] = useState<NotificationPermission>(supported ? Notification.permission : "denied")

  async function toggleReminders(on: boolean) {
    if (!on || !supported) return setReminders(false)
    const result = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission
    setPermission(result)
    setReminders(result === "granted")
  }

  function exportTasks() {
    const file = new Blob([JSON.stringify({ app: "taskly", version: 1, exportedAt: new Date().toISOString(), tasks }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(file)
    Object.assign(document.createElement("a"), { href: url, download: "taskly-tasks.json" }).click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function importTasks(file: File | undefined) {
    if (!file) return
    try {
      const json: unknown = JSON.parse(await file.text())
      const imported = parseTasks(Array.isArray(json) ? json : (json as { tasks?: unknown })?.tasks)
      if (!imported?.length) throw new Error("empty")
      merge(imported)
      setMessage({ text: `Imported ${imported.length} ${imported.length === 1 ? "task" : "tasks"}.`, ok: true })
    } catch {
      setMessage({ text: "That file isn't a Taskly export, so nothing was imported.", ok: false })
    }
    if (fileInput.current) fileInput.current.value = "" // allow choosing the same file again
  }

  const reminderStatus = !supported
    ? "This browser can't show notifications."
    : permission === "denied"
      ? "Notifications are blocked. Allow them in your browser's site settings."
      : reminders
        ? "You get a notification when a task's due time arrives. Taskly has to stay open in a tab."
        : "Get a notification when a task is due."

  return (
    <div className="animate-rise">
      <h1 className="text-page">Settings</h1>

      <div className="mt-4 grid grid-cols-1 gap-3 md:mt-8 md:grid-cols-2 md:items-start md:gap-4 lg:gap-6">
        <div className="min-w-0 space-y-3 md:space-y-4 lg:space-y-6">
          <details className="group rounded-3xl bg-surface px-4 md:rounded-4xl md:px-6">
            <summary className={`${summaryClass} min-h-[4.5rem] gap-4`}>
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-xl font-extrabold text-accent-ink">
                {(name.trim()[0] ?? "?").toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-bold">{name.trim() || "Your name"}</span>
                <span className="block text-[13px] font-medium text-muted">Stored on this device</span>
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-muted transition-transform duration-150 group-open:rotate-90" />
            </summary>
            <div className="pb-4">
              <label htmlFor="profile-name" className="mb-2 block text-xs font-semibold text-muted">
                Your name
              </label>
              <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="given-name" className={inputClass} />
            </div>
          </details>

          <div className="rounded-3xl bg-surface px-4 md:rounded-4xl md:px-6">
            <Row icon={Palette} label="Theme" value={THEME_NAME[theme]}>
              <SegmentedTabs id="theme" mode="radio" label="Theme" options={THEMES} value={theme} onChange={setTheme} />
            </Row>

            <div className="flex min-h-14 items-center gap-3 border-t border-line py-2">
              <Bell aria-hidden className="size-5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">Notifications</p>
                <p className="text-[13px] font-medium text-muted">{reminderStatus}</p>
              </div>
              <Toggle label="Due-time reminders" checked={reminders && permission === "granted"} disabled={!supported || permission === "denied"} onChange={toggleReminders} />
            </div>

            <Row icon={Database} label="Data & Storage" value={`${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}>
              <p className="text-sm font-medium text-muted">
                {kb(new Blob([JSON.stringify(tasks)]).size)} saved in this browser. Nothing is sent anywhere.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" size="md" onClick={exportTasks}>
                  <Download aria-hidden className="size-4" />
                  Export
                </Button>
                <Button variant="secondary" size="md" onClick={() => fileInput.current?.click()}>
                  <Upload aria-hidden className="size-4" />
                  Import
                </Button>
                <Button variant="secondary" size="md" onClick={() => setConfirm("reset")}>
                  <RotateCcw aria-hidden className="size-4" />
                  Sample data
                </Button>
                <Button variant="danger-soft" size="md" onClick={() => setConfirm("clear")}>
                  <Trash2 aria-hidden className="size-4" />
                  Delete all
                </Button>
              </div>
              <input ref={fileInput} type="file" accept="application/json,.json" hidden aria-label="Choose a Taskly export to import" onChange={(e) => importTasks(e.target.files?.[0])} />
              {message && (
                <p role="status" className={`mt-3 text-sm font-bold ${message.ok ? "text-accent-text" : "text-danger-text"}`}>
                  {message.text}
                </p>
              )}
            </Row>
          </div>
        </div>

        <div className="rounded-3xl bg-surface px-4 md:rounded-4xl md:px-6">
          <Row icon={CircleHelp} label="Help & Support">
            <dl className="space-y-2.5 text-[15px]">
              {[
                ["N", "Create a new task"],
                ["/", "Search your tasks"],
                ["Esc", "Close a dialog"],
              ].map(([key, text]) => (
                <div key={key} className="flex items-center gap-3">
                  <dt>
                    <kbd className="grid h-8 min-w-8 place-items-center rounded-lg bg-elevated px-2 font-sans text-xs font-extrabold">{key}</kbd>
                  </dt>
                  <dd className="font-medium text-muted">{text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm font-medium text-muted">Tick a task to complete it. Open one to see its checklist, edit it or delete it.</p>
          </Row>
          <Row icon={Info} label="About Taskly" value="v1.0.0">
            <p className="text-sm font-medium text-muted">
              Plan, focus, get it done. Your tasks live in this browser's storage: clearing site data removes them, so use Export to keep a backup.
            </p>
            <a href={links.welcome} className="mt-3 inline-grid min-h-11 place-items-center text-sm font-bold text-accent-text">
              Replay the welcome screen
            </a>
          </Row>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === "reset"}
        title="Replace your tasks with sample data?"
        message="Your current tasks will be removed and a fresh set of examples added."
        confirmLabel="Replace"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          resetToSample()
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === "clear"}
        title="Delete all tasks?"
        message="Every task will be removed. Export first if you want a copy."
        confirmLabel="Delete all"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          clear()
          setConfirm(null)
        }}
      />
    </div>
  )
}
