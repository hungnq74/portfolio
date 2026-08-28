"use client"

import { useEffect, useRef } from "react"

type HeroThreadFieldProps = {
  theme: "paper" | "signal"
  className?: string
}

type Point = {
  x: number
  y: number
}

type PointerState = Point & {
  targetX: number
  targetY: number
  targetVelocityX: number
  targetVelocityY: number
  velocityX: number
  velocityY: number
  strength: number
  targetStrength: number
  lastEventX: number
  lastEventY: number
  lastEventTime: number
}

type Palette = {
  ink: string
  line: string
  accent: string
  accentSecondary: string
}

const LINE_COUNT = 22
const ACCENT_LINE_INDEX = 12
const MAX_DPR = 1.5
const IDLE_X = 0.76
const IDLE_Y = 0.48

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const easeOutQuint = (value: number) => 1 - Math.pow(1 - value, 5)

function readPalette(host: HTMLDivElement, theme: HeroThreadFieldProps["theme"]): Palette {
  const scope = host.parentElement ?? document.documentElement
  const styles = window.getComputedStyle(scope)
  const fallback =
    theme === "signal"
      ? {
          ink: "#f2f2e8",
          line: "rgba(242, 242, 232, 0.2)",
          accent: "#c8ff45",
          accentSecondary: "#7b70ff",
        }
      : {
          ink: "#141411",
          line: "rgba(20, 20, 17, 0.2)",
          accent: "#ef4d2f",
          accentSecondary: "#3647ff",
        }

  const variable = (name: string, fallbackValue: string) =>
    styles.getPropertyValue(name).trim() || fallbackValue

  return {
    ink: variable("--ink", fallback.ink),
    line: variable("--line", fallback.line),
    accent: variable("--accent", fallback.accent),
    accentSecondary: variable("--accent-2", fallback.accentSecondary),
  }
}

export function HeroThreadField({ theme, className }: HeroThreadFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")

    if (!host || !canvas || !context) return

    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let palette = readPalette(host, theme)
    let width = 0
    let height = 0
    let frame = 0
    let isIntersecting = false
    let isDocumentVisible = !document.hidden
    let isEnhanced = finePointerQuery.matches && !reducedMotionQuery.matches
    let isDestroyed = false

    const pointer: PointerState = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      targetVelocityX: 0,
      targetVelocityY: 0,
      velocityX: 0,
      velocityY: 0,
      strength: 0,
      targetStrength: 0,
      lastEventX: 0,
      lastEventY: 0,
      lastEventTime: 0,
    }

    const resetPointer = () => {
      const idleX = width * IDLE_X
      const idleY = height * IDLE_Y
      pointer.x = idleX
      pointer.y = idleY
      pointer.targetX = idleX
      pointer.targetY = idleY
      pointer.targetVelocityX = 0
      pointer.targetVelocityY = 0
      pointer.velocityX = 0
      pointer.velocityY = 0
      pointer.strength = 0
      pointer.targetStrength = 0
      pointer.lastEventTime = 0
    }

    const returnToIdle = () => {
      pointer.targetX = width * IDLE_X
      pointer.targetY = height * IDLE_Y
      pointer.targetVelocityX = 0
      pointer.targetVelocityY = 0
      pointer.targetStrength = 0
      pointer.lastEventTime = 0
    }

    const drawThread = (
      lineIndex: number,
      deformationStrength: number,
      animated: boolean,
    ) => {
      const lineProgress = lineIndex / (LINE_COUNT - 1)
      const baseY = height * (0.06 + lineProgress * 0.88)
      const segmentCount = clamp(Math.ceil(width / 22), 36, 82)
      const influenceRadius = clamp(Math.min(width, height) * 0.34, 180, 360)
      const points: Point[] = []

      for (let segment = 0; segment <= segmentCount; segment += 1) {
        const progress = segment / segmentCount
        const x = width * (-0.04 + progress * 1.12)
        const diagonal = (progress - 0.5) * height * 0.12
        const staticWave =
          Math.sin(progress * Math.PI * 1.65 + lineIndex * 0.17) *
          height *
          0.006
        let pointX = x
        let pointY = baseY + diagonal + staticWave

        if (animated && deformationStrength > 0.001) {
          const deltaX = pointer.x - pointX
          const deltaY = pointer.y - pointY
          const distance = Math.hypot(deltaX, deltaY)
          const normalizedDistance = clamp(1 - distance / influenceRadius, 0, 1)
          const influence =
            easeOutQuint(normalizedDistance) * deformationStrength
          const centerBias = 0.09 + Math.sin(lineProgress * Math.PI) * 0.09

          pointX += deltaX * influence * centerBias
          pointY += deltaY * influence * (0.2 + centerBias)

          const wake = influence * (1 - normalizedDistance * 0.35)
          pointX += pointer.velocityX * wake * 1.55
          pointY += pointer.velocityY * wake * 1.9
          pointY += pointer.velocityX * wake * (lineProgress - 0.5) * 0.34
        }

        points.push({ x: pointX, y: pointY })
      }

      context.beginPath()
      context.moveTo(points[0].x, points[0].y)

      for (let index = 1; index < points.length - 1; index += 1) {
        const point = points[index]
        const next = points[index + 1]
        context.quadraticCurveTo(
          point.x,
          point.y,
          (point.x + next.x) * 0.5,
          (point.y + next.y) * 0.5,
        )
      }

      const lastPoint = points[points.length - 1]
      context.lineTo(lastPoint.x, lastPoint.y)

      if (lineIndex === ACCENT_LINE_INDEX) {
        context.strokeStyle = palette.accentSecondary
        context.globalAlpha = 0.16
        context.lineWidth = 5
        context.stroke()

        context.strokeStyle = palette.accent
        context.globalAlpha = 0.9
        context.lineWidth = 1.65
        context.stroke()
      } else {
        context.strokeStyle = palette.line
        context.globalAlpha = 0.72
        context.lineWidth = 0.8
        context.stroke()
      }
    }

    const applyHeadlineMask = () => {
      context.save()
      context.globalCompositeOperation = "destination-in"

      const horizontalMask = context.createLinearGradient(0, 0, width, 0)
      horizontalMask.addColorStop(0, "rgba(0, 0, 0, 0.02)")
      horizontalMask.addColorStop(0.24, "rgba(0, 0, 0, 0.06)")
      horizontalMask.addColorStop(0.48, "rgba(0, 0, 0, 0.48)")
      horizontalMask.addColorStop(0.7, "rgba(0, 0, 0, 0.94)")
      horizontalMask.addColorStop(1, "rgba(0, 0, 0, 0.72)")
      context.fillStyle = horizontalMask
      context.fillRect(0, 0, width, height)

      const edgeMask = context.createLinearGradient(0, 0, 0, height)
      edgeMask.addColorStop(0, "rgba(0, 0, 0, 0)")
      edgeMask.addColorStop(0.08, "rgba(0, 0, 0, 0.9)")
      edgeMask.addColorStop(0.82, "rgba(0, 0, 0, 0.88)")
      edgeMask.addColorStop(1, "rgba(0, 0, 0, 0)")
      context.fillStyle = edgeMask
      context.fillRect(0, 0, width, height)
      context.restore()
    }

    const draw = (animated: boolean) => {
      if (!width || !height) return

      context.clearRect(0, 0, width, height)
      context.save()
      context.lineCap = "round"
      context.lineJoin = "round"

      for (let lineIndex = 0; lineIndex < LINE_COUNT; lineIndex += 1) {
        drawThread(lineIndex, pointer.strength, animated)
      }

      context.restore()
      applyHeadlineMask()
      context.globalAlpha = 1
      context.globalCompositeOperation = "source-over"
    }

    const shouldAnimate = () =>
      isEnhanced && isIntersecting && isDocumentVisible && !isDestroyed

    const queueFrame = () => {
      if (!frame && shouldAnimate()) frame = window.requestAnimationFrame(tick)
    }

    const tick = () => {
      frame = 0
      if (!shouldAnimate()) return

      const previousX = pointer.x
      const previousY = pointer.y
      pointer.x += (pointer.targetX - pointer.x) * 0.115
      pointer.y += (pointer.targetY - pointer.y) * 0.115

      const easedVelocityX = pointer.x - previousX
      const easedVelocityY = pointer.y - previousY
      pointer.velocityX +=
        (easedVelocityX + pointer.targetVelocityX * 0.34 - pointer.velocityX) * 0.18
      pointer.velocityY +=
        (easedVelocityY + pointer.targetVelocityY * 0.34 - pointer.velocityY) * 0.18
      pointer.targetVelocityX *= 0.8
      pointer.targetVelocityY *= 0.8
      pointer.strength += (pointer.targetStrength - pointer.strength) * 0.09

      draw(true)

      const isSettled =
        Math.abs(pointer.targetStrength - pointer.strength) < 0.002 &&
        Math.abs(pointer.targetX - pointer.x) < 0.2 &&
        Math.abs(pointer.targetY - pointer.y) < 0.2 &&
        Math.abs(pointer.velocityX) < 0.02 &&
        Math.abs(pointer.velocityY) < 0.02

      if (!isSettled) queueFrame()
    }

    const cancelFrame = () => {
      if (!frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    const syncAnimation = () => {
      isEnhanced = finePointerQuery.matches && !reducedMotionQuery.matches

      if (shouldAnimate()) {
        queueFrame()
      } else {
        cancelFrame()
        resetPointer()
        draw(false)
      }
    }

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      const nextWidth = Math.max(1, bounds.width)
      const nextHeight = Math.max(1, bounds.height)
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

      width = nextWidth
      height = nextHeight
      canvas.width = Math.round(nextWidth * dpr)
      canvas.height = Math.round(nextHeight * dpr)
      canvas.style.width = `${nextWidth}px`
      canvas.style.height = `${nextHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      palette = readPalette(host, theme)
      resetPointer()
      draw(false)
      queueFrame()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isEnhanced) return

      const bounds = host.getBoundingClientRect()
      const isInside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom

      if (!isInside) {
        returnToIdle()
        return
      }

      const localX = event.clientX - bounds.left
      const localY = event.clientY - bounds.top
      const now = event.timeStamp || performance.now()

      if (pointer.lastEventTime) {
        const eventDelta = clamp(now - pointer.lastEventTime, 8, 48)
        const frameScale = 16.667 / eventDelta
        pointer.targetVelocityX = clamp(
          (localX - pointer.lastEventX) * frameScale,
          -30,
          30,
        )
        pointer.targetVelocityY = clamp(
          (localY - pointer.lastEventY) * frameScale,
          -30,
          30,
        )
      } else {
        pointer.x = localX
        pointer.y = localY
      }

      pointer.targetX = localX
      pointer.targetY = localY
      pointer.targetStrength = 1
      pointer.lastEventX = localX
      pointer.lastEventY = localY
      pointer.lastEventTime = now
      queueFrame()
    }

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden
      if (isDocumentVisible) palette = readPalette(host, theme)
      syncAnimation()
    }

    const handleMediaChange = () => {
      returnToIdle()
      syncAnimation()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry?.isIntersecting ?? false
        syncAnimation()
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(host)

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("blur", returnToIdle)
    document.documentElement.addEventListener("mouseleave", returnToIdle)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    finePointerQuery.addEventListener("change", handleMediaChange)
    reducedMotionQuery.addEventListener("change", handleMediaChange)

    resize()
    syncAnimation()

    return () => {
      isDestroyed = true
      cancelFrame()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("blur", returnToIdle)
      document.documentElement.removeEventListener("mouseleave", returnToIdle)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      finePointerQuery.removeEventListener("change", handleMediaChange)
      reducedMotionQuery.removeEventListener("change", handleMediaChange)
    }
  }, [theme])

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: "block", pointerEvents: "none" }}
      />
    </div>
  )
}
