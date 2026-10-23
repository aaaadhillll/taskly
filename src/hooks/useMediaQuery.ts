import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const media = matchMedia(query)
      media.addEventListener("change", notify)
      return () => media.removeEventListener("change", notify)
    },
    () => matchMedia(query).matches,
  )
}

/**
 * The width where the editorial two-column dashboard takes over. Below it (phones, tablets and small
 * laptops with the side rail) the roomier one-column composition is used, so nothing is squeezed.
 */
export const useIsDesktop = () => useMediaQuery("(min-width: 1280px)")
