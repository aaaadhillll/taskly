import { useId } from "react"
import { cn } from "@/utils/cn"

/**
 * The layered lime-lit spheres behind the welcome and category headings: a large ring, a sphere that
 * fades from dark to lime toward its lower right, and a soft glowing crescent along its rim.
 * Decorative only, and painted from the theme's own colours so it works on light and dark.
 */
export function Orb({ className }: { className?: string }) {
  const id = useId()
  const ref = (name: string) => `url(#${id}-${name})`
  return (
    <svg aria-hidden viewBox="0 0 420 420" fill="none" className={cn("overflow-visible", className)}>
      <defs>
        <radialGradient id={`${id}-bowl`} cx="82%" cy="86%" r="100%">
          <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 1 }} />
          <stop offset="0.2" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.72 }} />
          <stop offset="0.5" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.2 }} />
          <stop offset="0.85" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.04 }} />
          <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="14%" cy="26%" r="85%">
          <stop offset="0" style={{ stopColor: "var(--color-canvas)", stopOpacity: 0.95 }} />
          <stop offset="0.55" style={{ stopColor: "var(--color-canvas)", stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: "var(--color-canvas)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
          <stop offset="0.55" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.85 }} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-text)", stopOpacity: 0.09 }} />
          <stop offset="0.6" style={{ stopColor: "var(--color-text)", stopOpacity: 0 }} />
        </linearGradient>
        <mask id={`${id}-crescent`}>
          <circle cx="270" cy="180" r="170" fill="white" />
          <circle cx="238" cy="148" r="164" fill="black" />
        </mask>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* the big outer ring and its faint sheen */}
      <circle cx="205" cy="215" r="205" fill={ref("sheen")} />
      <circle cx="205" cy="215" r="205" stroke={ref("rim")} strokeWidth="1.5" />

      {/* the sphere: lime toward the lower right, shaded to the page colour toward the upper left */}
      <circle cx="270" cy="180" r="170" fill={ref("bowl")} />
      <circle cx="270" cy="180" r="170" fill={ref("shade")} />

      {/* the glowing crescent along its rim */}
      <g mask={ref("crescent")} filter={ref("glow")}>
        <rect x="90" y="0" width="360" height="380" style={{ fill: "var(--color-accent)", fillOpacity: 0.9 }} />
      </g>
      <circle cx="270" cy="180" r="170" stroke={ref("rim")} strokeWidth="1.5" />
    </svg>
  )
}
