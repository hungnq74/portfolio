"use client"

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { Canvas, type RootState } from "@react-three/fiber"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion"
import {
  CONCEPT_FEATURED_PROJECTS,
  type ConceptProject as ConceptFeaturedProject,
} from "../conceptProjects"
import {
  WorkScene,
  type WorldPointerState,
  type WorldScrollState,
} from "./WorkScene"
import { PlotterPoster } from "./posters/PlotterPoster"
import styles from "./WorkWorld.module.css"

export type WorkWorldTheme = "paper" | "signal"

export type WorkWorldProps = {
  theme: WorkWorldTheme
  className?: string
}

type CanvasBoundaryProps = {
  children: React.ReactNode
  onError: () => void
  resetKey: string
}

type CanvasBoundaryState = {
  failed: boolean
}

class CanvasBoundary extends Component<CanvasBoundaryProps, CanvasBoundaryState> {
  state: CanvasBoundaryState = { failed: false }

  static getDerivedStateFromError(): CanvasBoundaryState {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  componentDidUpdate(previousProps: CanvasBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false })
    }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))

const smooth = (from: number, to: number, value: number) => {
  const x = clamp((value - from) / (to - from))
  return x * x * (3 - 2 * x)
}

function useMediaQuery(query: string, initialValue = false) {
  const [matches, setMatches] = useState(initialValue)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])

  return matches
}

function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const testCanvas = document.createElement("canvas")
      const context =
        testCanvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
        testCanvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })
      setSupported(Boolean(context))
    } catch {
      setSupported(false)
    }
  }, [])

  return supported
}

function MagneticLink({
  project,
  enabled,
  tabIndex,
}: {
  project: ConceptFeaturedProject
  enabled: boolean
  tabIndex: number
}) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.38 })
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.38 })

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!enabled || !linkRef.current) return
    const bounds = linkRef.current.getBoundingClientRect()
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.2)
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.2)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={linkRef}
      className={styles.projectLink}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      data-cursor="View"
      aria-label={`View ${project.name} project`}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      style={enabled ? { x: springX, y: springY } : undefined}
    >
      <span>View project</span>
      <span aria-hidden="true">↗</span>
    </motion.a>
  )
}

function StaticWorkList({
  projects,
  theme,
  className,
}: {
  projects: readonly ConceptFeaturedProject[]
  theme: WorkWorldTheme
  className?: string
}) {
  return (
    <div
      className={`${styles.staticWorld}${className ? ` ${className}` : ""}`}
      data-theme={theme}
      data-reduced-motion="true"
    >
      <div className={styles.staticList}>
        {projects.map((project, projectIndex) => (
          <article
            id={`work-${project.slug}`}
            className={styles.staticCard}
            key={project.slug}
          >
            <div className={styles.staticVisual} aria-hidden="true">
              <PlotterPoster kind={project.artifact.kind} />
            </div>
            <div className={styles.staticCopy}>
              <div className={styles.projectMeta}>
                <span>{String(projectIndex + 1).padStart(2, "0")} / 05</span>
                <span>{project.role}</span>
              </div>
              <h3>{project.name}</h3>
              <p className={styles.projectDescriptor}>{project.descriptor}</p>
              <p className={styles.projectSummary}>{project.summary}</p>
              <dl
                className={styles.staticProofs}
                style={{
                  gridTemplateColumns: `repeat(${project.proofs.length}, minmax(0, 1fr))`,
                }}
              >
                {project.proofs.map((proof) => (
                  <div key={`${project.slug}-${proof.value}-${proof.label}`}>
                    <dt>{proof.value}</dt>
                    <dd>
                      {proof.label}
                      {proof.qualifier ? <small>{proof.qualifier}</small> : null}
                      {proof.detail ? <small>{proof.detail}</small> : null}
                    </dd>
                  </div>
                ))}
              </dl>
              <MagneticLink
                project={project}
                enabled={false}
                tabIndex={0}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function WorkWorld({
  theme,
  className,
}: WorkWorldProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const chapterMarkers = useRef<Array<HTMLElement | null>>([])
  const contextHandlers = useRef<{
    canvas: HTMLCanvasElement
    lost: (event: Event) => void
    restored: () => void
  } | null>(null)
  const scrollState = useRef<WorldScrollState>({
    progress: 0,
    active: 0,
    local: 0,
  })
  const pointerState = useRef<WorldPointerState>({ x: 0, y: 0 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter")
  const [sectionVisible, setSectionVisible] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [contextLost, setContextLost] = useState(false)
  const [canvasError, setCanvasError] = useState(false)
  const prefersReducedMotion = useReducedMotion() ?? false
  const compact = useMediaQuery("(max-width: 900px)")
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)")
  const webGLSupported = useWebGLSupport()
  const { scrollY } = useScroll()
  const safeProjects: readonly ConceptFeaturedProject[] =
    CONCEPT_FEATURED_PROJECTS
  const activeProject = safeProjects[activeIndex] ?? safeProjects[0]

  const syncScrollState = useCallback((scrollPosition: number) => {
    if (!safeProjects.length) return
    const root = rootRef.current
    if (!root) return

    const navOffset = compact ? 104 : 96
    const rootTop = root.getBoundingClientRect().top + scrollPosition
    const firstMarker = chapterMarkers.current[0]
    const lastMarker = chapterMarkers.current[safeProjects.length - 1]
    const stickyTravel =
      firstMarker && lastMarker
        ? lastMarker.offsetTop + lastMarker.offsetHeight - firstMarker.offsetTop
        : window.innerHeight * 1.25 * safeProjects.length
    const progress = clamp(
      (scrollPosition - (rootTop - navOffset)) / stickyTravel,
    )
    const scaled = Math.min(progress, 0.999999) * safeProjects.length
    const nextIndex = Math.min(safeProjects.length - 1, Math.floor(scaled))
    const local = scaled - nextIndex
    const enter = smooth(0, 0.18, local)
    const exit = smooth(0.72, 1, local)
    const presence = Math.min(enter, 1 - exit)
    const metricProgress = clamp((local - 0.12) / 0.25) * (1 - exit)
    const nextPhase = local < 0.18 ? "enter" : local > 0.72 ? "exit" : "hold"

    scrollState.current.progress = progress
    scrollState.current.active = nextIndex
    scrollState.current.local = local

    if (nextIndex !== activeIndex) setActiveIndex(nextIndex)
    if (nextPhase !== phase) setPhase(nextPhase)

    root.style.setProperty("--world-progress", progress.toFixed(5))
    root.style.setProperty("--segment-progress", local.toFixed(5))
    root.style.setProperty("--enter-progress", enter.toFixed(5))
    root.style.setProperty("--exit-progress", exit.toFixed(5))
    root.style.setProperty("--chapter-presence", presence.toFixed(5))
    root.style.setProperty("--metric-progress", metricProgress.toFixed(5))
    root.style.setProperty(
      "--copy-y",
      `${((1 - enter) * 34 - exit * 24).toFixed(2)}px`,
    )
  }, [activeIndex, compact, phase, safeProjects])

  useMotionValueEvent(scrollY, "change", syncScrollState)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => syncScrollState(window.scrollY))
    const handleResize = () => syncScrollState(window.scrollY)
    window.addEventListener("resize", handleResize, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", handleResize)
    }
  }, [syncScrollState])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { rootMargin: "18% 0px 18% 0px", threshold: 0 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState === "visible")
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  useEffect(
    () => () => {
      const handlers = contextHandlers.current
      if (!handlers) return
      handlers.canvas.removeEventListener("webglcontextlost", handlers.lost)
      handlers.canvas.removeEventListener(
        "webglcontextrestored",
        handlers.restored,
      )
    },
    [],
  )

  useEffect(() => {
    setCanvasError(false)
  }, [theme])

  const handleCreated = useCallback((state: RootState) => {
    const previousHandlers = contextHandlers.current
    if (previousHandlers) {
      previousHandlers.canvas.removeEventListener(
        "webglcontextlost",
        previousHandlers.lost,
      )
      previousHandlers.canvas.removeEventListener(
        "webglcontextrestored",
        previousHandlers.restored,
      )
    }

    const canvas = state.gl.domElement
    const lost = (event: Event) => {
      event.preventDefault()
      setContextLost(true)
    }
    const restored = () => setContextLost(false)
    canvas.addEventListener("webglcontextlost", lost, false)
    canvas.addEventListener("webglcontextrestored", restored, false)
    contextHandlers.current = { canvas, lost, restored }
  }, [])

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!finePointer || prefersReducedMotion) return
    pointerState.current.x = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1)
    pointerState.current.y = clamp(
      -((event.clientY / window.innerHeight) * 2 - 1),
      -1,
      1,
    )
  }

  const resetPointer = () => {
    pointerState.current.x = 0
    pointerState.current.y = 0
  }

  if (!safeProjects.length) return null

  if (prefersReducedMotion) {
    return <StaticWorkList projects={safeProjects} theme={theme} className={className} />
  }

  const canUseCanvas = webGLSupported === true && !canvasError
  const useStaticPlotter = !canUseCanvas || contextLost
  const shouldAnimate = sectionVisible && documentVisible && !contextLost
  const highQuality = !compact

  return (
    <div
      ref={rootRef}
      className={`${styles.workWorld}${className ? ` ${className}` : ""}`}
      data-theme={theme}
      data-phase={phase}
      data-webgl={canUseCanvas && !contextLost ? "active" : "fallback"}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={
        {
          "--world-progress": 0,
          "--segment-progress": 0,
          "--enter-progress": 0,
          "--exit-progress": 0,
          "--chapter-presence": 0,
          "--metric-progress": 0,
          "--copy-y": "34px",
        } as React.CSSProperties
      }
    >
      <div className={styles.stickyStage}>
        <div className={styles.stageGrid} aria-hidden="true" />
        <div
          className={styles.stagePoster}
          data-fallback={useStaticPlotter ? "true" : "false"}
          aria-hidden="true"
        >
          <PlotterPoster kind={activeProject.artifact.kind} />
        </div>

        {canUseCanvas ? (
          <CanvasBoundary
            onError={() => setCanvasError(true)}
            resetKey={theme}
          >
            <div
              className={styles.canvasWrap}
              data-context-lost={contextLost ? "true" : "false"}
              aria-hidden="true"
            >
              <Canvas
                aria-hidden="true"
                orthographic
                dpr={compact ? 1 : [1, 1.5]}
                camera={{
                  position: [0, 0, 10],
                  zoom: compact ? 70 : 104,
                  near: 0.1,
                  far: 30,
                }}
                frameloop={shouldAnimate ? "always" : "never"}
                gl={{
                  alpha: true,
                  antialias: !compact,
                  powerPreference: compact ? "low-power" : "high-performance",
                }}
                onCreated={handleCreated}
              >
                <WorkScene
                  projects={safeProjects}
                  activeIndex={activeIndex}
                  scroll={scrollState}
                  pointer={pointerState}
                  compact={compact}
                  highQuality={highQuality}
                  theme={theme}
                />
              </Canvas>
            </div>
          </CanvasBoundary>
        ) : null}

        <div className={styles.copyDeck}>
          {safeProjects.map((project, projectIndex) => {
            const isActive = projectIndex === activeIndex
            return (
              <article
                ref={(node) => {
                  if (!node) return
                  if (isActive) node.removeAttribute("inert")
                  else node.setAttribute("inert", "")
                }}
                className={styles.chapterCopy}
                key={project.slug}
                data-active={isActive ? "true" : "false"}
                aria-hidden={!isActive}
                aria-labelledby={`work-${project.slug}-title`}
              >
                <div className={styles.projectMeta}>
                  <span>{project.role}</span>
                </div>

                <div className={styles.projectIdentity}>
                  <h3 id={`work-${project.slug}-title`}>{project.name}</h3>
                  <p className={styles.projectDescriptor}>{project.descriptor}</p>
                  <p className={styles.projectSummary}>{project.summary}</p>
                </div>

                <div className={styles.projectBottom}>
                  <dl
                    className={styles.proofGrid}
                    style={{
                      gridTemplateColumns: `repeat(${project.proofs.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {project.proofs.map((proof, proofIndex) => (
                      <div
                        key={`${project.slug}-${proof.value}-${proof.label}`}
                        style={
                          { "--proof-order": proofIndex } as React.CSSProperties
                        }
                      >
                        <dt>{proof.value}</dt>
                        <dd>
                          <span>{proof.label}</span>
                          {proof.qualifier ? <small>{proof.qualifier}</small> : null}
                          {proof.detail ? <small>{proof.detail}</small> : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <MagneticLink
                    project={project}
                    enabled={finePointer}
                    tabIndex={isActive && phase === "hold" ? 0 : -1}
                  />
                </div>
              </article>
            )
          })}
        </div>

        <nav className={styles.projectRail} aria-label="Featured project progress">
          <span className={styles.railTrack} aria-hidden="true">
            <span />
          </span>
          {safeProjects.map((project, projectIndex) => (
            <a
              key={project.slug}
              href={`#work-${project.slug}`}
              className={styles.railItem}
              data-active={projectIndex === activeIndex ? "true" : "false"}
              data-passed={projectIndex <= activeIndex ? "true" : "false"}
              aria-current={projectIndex === activeIndex ? "location" : undefined}
            >
              <span>{String(projectIndex + 1).padStart(2, "0")}</span>
              <span>{project.name}</span>
              <i aria-hidden="true" />
            </a>
          ))}
        </nav>

        {useStaticPlotter ? (
          <p className={styles.fallbackLabel} aria-live="polite">
            {contextLost ? "Reloading the visual" : "Showing a static view"}
          </p>
        ) : null}
      </div>

      <div
        className={styles.chapters}
        role="group"
        aria-label="Featured project chapters"
      >
        {safeProjects.map((project, projectIndex) => (
          <section
            ref={(node) => {
              chapterMarkers.current[projectIndex] = node
            }}
            id={`work-${project.slug}`}
            className={styles.chapter}
            key={project.slug}
            aria-labelledby={`work-${project.slug}-chapter-label`}
          >
            <h3
              id={`work-${project.slug}-chapter-label`}
              className={styles.chapterLabel}
            >
              {String(projectIndex + 1).padStart(2, "0")} of 05 · {project.name}
            </h3>
          </section>
        ))}
      </div>
    </div>
  )
}

export default WorkWorld
