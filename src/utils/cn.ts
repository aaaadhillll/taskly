import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge resolves clashes (a variant's text colour vs a caller's) so the last class wins,
// instead of leaving it to stylesheet order. It has to be told about this app's own tokens, or it
// would take `text-task` (a font size) for a colour and drop one of the two.
const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "page", "h1", "feature", "task"],
      color: [
        "canvas", "surface", "elevated", "text", "muted", "line",
        "accent", "accent-ink", "accent-text",
                "danger", "warning", "danger-text", "warning-text", "ring", "bar", "line-strong", "cream", "btn", "btn-hover", "edge", "accent-edge", "check", "on-check", "solid", "on-solid",
      ],
    },
  },
})

/** Joins class names, skipping falsy values, and resolves conflicting Tailwind utilities. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return merge(parts.filter(Boolean).join(" "))
}
