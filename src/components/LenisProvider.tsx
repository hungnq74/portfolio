"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { cancelFrame, frame } from "framer-motion"
import Lenis from "lenis"

declare global {
  interface Window { __lenis?: Lenis }
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const useNativeScroll =
    pathname === "/concept" || pathname.startsWith("/concept/")

  useEffect(() => {
    const smoothPointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let lenis: Lenis | undefined
    let tick: ((data: { timestamp: number }) => void) | undefined

    const destroyLenis = () => {
      if (tick) {
        cancelFrame(tick)
        tick = undefined
      }

      lenis?.destroy()
      lenis = undefined
      delete window.__lenis
    }

    const syncLenis = () => {
      if (useNativeScroll || !smoothPointer.matches || reducedMotion.matches) {
        destroyLenis()
        return
      }

      if (lenis) return

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })

      window.__lenis = lenis

      /*
       * Lenis used to drive itself from its own requestAnimationFrame while
       * Motion ran a second loop of its own. Scroll position was written in one
       * frame and read in the next, which left every scroll-linked animation
       * trailing the actual scroll by a frame.
       *
       * Driving Lenis from Motion's frameloop — the same single-ticker idea
       * GSAP applies with gsap.ticker — puts the scroll update and everything
       * reading it in one pass, in order.
       */
      tick = ({ timestamp }) => {
        lenis?.raf(timestamp)
      }

      frame.update(tick, true)
    }

    syncLenis()
    smoothPointer.addEventListener("change", syncLenis)
    reducedMotion.addEventListener("change", syncLenis)

    return () => {
      smoothPointer.removeEventListener("change", syncLenis)
      reducedMotion.removeEventListener("change", syncLenis)
      destroyLenis()
    }
  }, [useNativeScroll])

  return <>{children}</>
}
