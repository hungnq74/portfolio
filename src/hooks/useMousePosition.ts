"use client"
import { useState, useEffect, useRef } from "react"

export interface MousePosition {
  x: number      // raw px
  y: number      // raw px
  nx: number     // normalized -1 to 1
  ny: number     // normalized -1 to 1
  vx: number     // velocity x
  vy: number     // velocity y
}

export function useMousePosition() {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0, nx: 0, ny: 0, vx: 0, vy: 0 })
  const prev = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      const vx = e.clientX - prev.current.x
      const vy = e.clientY - prev.current.y
      prev.current = { x: e.clientX, y: e.clientY }
      setPos({ x: e.clientX, y: e.clientY, nx, ny, vx, vy })
    }

    window.addEventListener("mousemove", handler, { passive: true })
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  return pos
}
