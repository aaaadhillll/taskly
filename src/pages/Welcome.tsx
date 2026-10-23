import { ArrowRight } from "lucide-react"
import { links, navigate } from "@/hooks/useRoute"
import { useSettings } from "@/hooks/useSettings"
import { buttonClass } from "@/components/ui/Button"
import { Orb } from "@/components/ui/Orb"

/** The first-run welcome screen. There are no accounts, so it has one way forward. */
export function WelcomePage() {
  const { setWelcomed } = useSettings()
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 md:px-16 lg:px-28">
      <Orb className="absolute -right-28 -top-16 -z-10 size-[25rem] md:-right-24 md:-top-28 md:size-[46rem]" />

      <p className="text-[1.75rem] font-extrabold tracking-tight">Taskly</p>

      <div className="mt-auto pb-10 md:pb-16">
        <h1 className="text-[clamp(3rem,1.8rem+5.5vw,8rem)] font-extrabold leading-[1] tracking-[-0.05em]">
          Plan
          <br />
          Focus
          <br />
          <span className="text-accent-text">Get it done.</span>
        </h1>
        <p className="mt-5 max-w-[17rem] text-[15px] font-medium text-muted md:max-w-md md:text-lg">A minimal to-do app to organize your day and build better habits.</p>
      </div>

      <div className="md:max-w-md">
        <a
          href={links.home}
          onClick={(e) => {
            e.preventDefault()
            setWelcomed(true)
            navigate(links.home)
          }}
          className={buttonClass("primary", "lg", "relative w-full")}
        >
          Get Started
          <ArrowRight aria-hidden className="absolute right-5 size-5" strokeWidth={2.5} />
        </a>
        <p className="mt-5 text-center text-sm font-medium text-muted">Your tasks stay on this device.</p>
      </div>
    </div>
  )
}
