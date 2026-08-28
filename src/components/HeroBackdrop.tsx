"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { VideoBackground } from "./VideoBackground"

const GlassBackdrop = dynamic(() => import("./GlassBackdrop"), { ssr: false })

type Mode = "pending" | "video" | "glass-high" | "glass-low"

function detect(): Mode {
  if (typeof window === "undefined") return "video"

  // Transmission re-renders the scene into an offscreen buffer every frame. On
  // a phone, or for someone who asked for less motion, that cost buys nothing.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "video"

  const coarse = window.matchMedia("(pointer: coarse)").matches
  if (coarse || window.innerWidth < 900) return "video"

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (typeof memory === "number" && memory < 4) return "video"

  try {
    const probe = document.createElement("canvas")
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return "video"
  } catch {
    return "video"
  }

  return window.innerWidth >= 1440 ? "glass-high" : "glass-low"
}

export function HeroBackdrop() {
  // Start on the video so the first paint never waits on a capability check.
  const [mode, setMode] = useState<Mode>("pending")

  useEffect(() => {
    setMode(detect())
  }, [])

  if (mode === "pending" || mode === "video") return <VideoBackground />

  return (
    <div className="fixed inset-0 -z-10">
      <GlassBackdrop
        quality={mode === "glass-high" ? "high" : "low"}
        onFailure={() => setMode("video")}
      />
    </div>
  )
}
