import { createContext, use, useEffect, useMemo, type ReactNode } from "react"
import { useLocalStorage } from "./useLocalStorage"

export type ThemePref = "dark" | "light" | "system"

interface SettingsApi {
  name: string
  setName: (name: string) => void
  theme: ThemePref
  setTheme: (theme: ThemePref) => void
  /** Whether the visitor asked for due-time reminders (the browser permission is separate) */
  reminders: boolean
  setReminders: (on: boolean) => void
  /** Whether the first-run welcome screen has been dismissed */
  welcomed: boolean
  setWelcomed: (done: boolean) => void
}

const SettingsContext = createContext<SettingsApi | null>(null)

const parseName = (raw: unknown) => (typeof raw === "string" ? raw : undefined)
const parseTheme = (raw: unknown) => (raw === "dark" || raw === "light" || raw === "system" ? raw : undefined)
const parseBool = (raw: unknown) => (typeof raw === "boolean" ? raw : undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useLocalStorage("taskly.name", () => "Adhil", parseName)
  const [theme, setTheme] = useLocalStorage<ThemePref>("taskly.theme", () => "dark", parseTheme)
  const [reminders, setReminders] = useLocalStorage("taskly.reminders", () => false, parseBool)
  const [welcomed, setWelcomed] = useLocalStorage("taskly.welcomed", () => false, parseBool)

  // Dark is the default look; "system" follows the OS live
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      document.documentElement.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme
      // Tint the phone's browser bar to match the page
      document.querySelector<HTMLMetaElement>("meta[name=theme-color]")?.setAttribute("content", getComputedStyle(document.body).backgroundColor)
    }
    apply()
    if (theme !== "system") return
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [theme])

  const api = useMemo(
    () => ({ name, setName, theme, setTheme, reminders, setReminders, welcomed, setWelcomed }),
    [name, setName, theme, setTheme, reminders, setReminders, welcomed, setWelcomed],
  )
  return <SettingsContext value={api}>{children}</SettingsContext>
}

export function useSettings(): SettingsApi {
  const ctx = use(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>")
  return ctx
}
