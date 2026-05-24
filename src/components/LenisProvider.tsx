"use client"
import { useEffect } from "react"
import Lenis from "lenis"

declare global {
  interface Window { __lenis?: Lenis }
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const smoothPointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let lenis: Lenis | undefined
    let rafId: number | undefined

    const destroyLenis = () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId)
        rafId = undefined
      }

      lenis?.destroy()
      lenis = undefined
      delete window.__lenis
    }

    const syncLenis = () => {
      if (!smoothPointer.matches || reducedMotion.matches) {
        destroyLenis()
        return
      }

      if (lenis) return

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })

      window.__lenis = lenis

      const raf = (time: number) => {
        lenis?.raf(time)
        rafId = requestAnimationFrame(raf)
      }

      rafId = requestAnimationFrame(raf)
    }

    syncLenis()
    smoothPointer.addEventListener("change", syncLenis)
    reducedMotion.addEventListener("change", syncLenis)

    return () => {
      smoothPointer.removeEventListener("change", syncLenis)
      reducedMotion.removeEventListener("change", syncLenis)
      destroyLenis()
    }
  }, [])

  return <>{children}</>
}
