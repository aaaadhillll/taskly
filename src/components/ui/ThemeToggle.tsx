import { Moon, Sun } from "lucide-react"
import { useSettings } from "@/hooks/useSettings"
import { cn } from "@/utils/cn"
import { IconButton } from "./Button"

/** Sun/Moon toggle that flips between light and dark mode. "System" resolves to whichever the OS picked. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useSettings()

  const isDark =
    theme === "dark" ||
    (theme === "system" && typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <IconButton
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("size-11", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon aria-hidden className="size-5" /> : <Sun aria-hidden className="size-5" />}
    </IconButton>
  )
}
