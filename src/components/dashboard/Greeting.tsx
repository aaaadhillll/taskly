import { useSettings } from "@/hooks/useSettings"
import { formatDate, greeting, todayKey } from "@/utils/date"

/**
 * "Good morning," in small grey over the name in bold on a phone; one big "Good morning, Adhil."
 * from tablet width up. The date sits above it on wide screens only.
 */
export function Greeting() {
  const { name } = useSettings()
  const shown = name.trim() || "there"
  return (
    <div>
      <p className="hidden text-sm font-bold uppercase tracking-[0.14em] text-muted md:block">{formatDate(todayKey(), { weekday: "long", month: "long", day: "numeric" })}</p>
      <h1 className="text-[1.5rem] font-extrabold leading-tight tracking-tight md:mt-3 md:text-balance md:text-display">
        <span className="block text-[15px] font-medium tracking-normal text-muted md:inline md:text-[length:inherit] md:font-extrabold md:tracking-[inherit] md:text-text">
          {greeting()},
        </span>{" "}
        <span>{shown}</span>
        <span className="hidden text-accent-text md:inline">.</span>
      </h1>
    </div>
  )
}

/** The round initial that links to Settings. */
export function Avatar({ className }: { className?: string }) {
  const { name } = useSettings()
  return (
    <a
      href="#/settings"
      aria-label="Profile and settings"
      className={`grid size-11 shrink-0 place-items-center rounded-full bg-accent text-lg font-extrabold text-accent-ink ${className ?? ""}`}
    >
      {(name.trim()[0] ?? "?").toUpperCase()}
    </a>
  )
}
