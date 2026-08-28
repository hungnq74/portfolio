"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { canRender3D } from "@/lib/capability"
import { VideoBackground } from "./VideoBackground"

const GlassBackdrop = dynamic(() => import("./GlassBackdrop"), { ssr: false })

type Mode = "pending" | "video" | "glass-high" | "glass-low"

function detect(): Mode {
  // Transmission re-renders the scene into an offscreen buffer every frame, so
  // anywhere that cost cannot be paid, the plain video is the right answer.
  if (!canRender3D()) return "video"
  return window.innerWidth >= 1440 ? "glass-high" : "glass-low"
}

export function HeroBackdrop() {
  // Start on the video so the first paint never waits on a capability check.
  const [mode, setMode] = useState<Mode>("pending")

  useEffect(() => {
    // Width decides both whether and how richly this renders, so it has to be
    // re-read when the window changes rather than fixed at mount.
    const evaluate = () => setMode(detect())
    evaluate()
    window.addEventListener("resize", evaluate)
    return () => window.removeEventListener("resize", evaluate)
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
