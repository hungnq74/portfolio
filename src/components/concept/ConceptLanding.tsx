"use client"

import dynamic from "next/dynamic"
import { Bricolage_Grotesque } from "next/font/google"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion"
import { PROJECTS } from "@/lib/projects"

// Bricolage Grotesque carries every tier on this page, from the 9px labels to
// the display lines. `opsz` and `wdth` are loaded as real axes so the family
// can re-cut itself per size instead of being scaled up and down.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
})
import {
  CONCEPT_FEATURED_ORDER,
  CONCEPT_HERO_PROOFS,
  CONCEPT_STORY_MILESTONES,
} from "./conceptProjects"
import { HeroThreadField } from "./HeroThreadField"
import styles from "./ConceptLanding.module.css"

type Theme = "paper" | "signal"

const WorkWorld = dynamic(() => import("./work/WorkWorld"), {
  ssr: false,
  loading: () => (
    <div className={styles.worldLoading} role="status">
      <span>Loading</span>
      <i aria-hidden="true" />
    </div>
  ),
})

const CONCEPT_FEATURED_NAMES = new Set<string>(CONCEPT_FEATURED_ORDER)

const THREAD_SECTIONS = [
  { id: "top", index: "00", label: "Intro" },
  { id: "work", index: "01", label: "Work" },
  { id: "story", index: "02", label: "Story" },
  { id: "contact", index: "03", label: "Contact" },
]

const HERO_EASE = [0.22, 1, 0.36, 1] as const

function DeferredWorkWorld({ theme }: { theme: Theme }) {
  const gateRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const gate = gateRef.current
    if (!gate || shouldLoad) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: "50% 0px", threshold: 0 },
    )

    observer.observe(gate)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <div ref={gateRef} className={styles.worldGate}>
      {shouldLoad ? (
        <WorkWorld theme={theme} />
      ) : (
        <div className={styles.worldPrimer} aria-hidden="true">
          <span>Five plotted proofs</span>
          <i />
        </div>
      )}
    </div>
  )
}

export function ConceptLanding() {
  const [theme, setTheme] = useState<Theme>("paper")
  const [activeSection, setActiveSection] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorCoreRef = useRef<HTMLSpanElement>(null)
  const cursorRingRef = useRef<HTMLSpanElement>(null)
  const cursorLabelRef = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 26,
    mass: 0.2,
  })

  useMotionValueEvent(scrollYProgress, "change", () => {
    const marker = window.scrollY + window.innerHeight * 0.38
    let nextSection = 0

    THREAD_SECTIONS.forEach((section, index) => {
      const element = document.getElementById(section.id)
      if (element && element.offsetTop <= marker) nextSection = index
    })

    setActiveSection((currentSection) =>
      currentSection === nextSection ? currentSection : nextSection,
    )
  })

  const archiveProjects = useMemo(
    () =>
      PROJECTS.filter(
        (project) => !CONCEPT_FEATURED_NAMES.has(project.name),
      ),
    [],
  )

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("hung-portfolio-concept-theme")
    if (savedTheme === "paper" || savedTheme === "signal") {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const cursor = cursorRef.current
    const cursorCore = cursorCoreRef.current
    const cursorRing = cursorRingRef.current
    const cursorLabel = cursorLabelRef.current
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (!root || !cursor || !cursorCore || !cursorRing || !cursorLabel) return

    let enhanced = false
    let frame = 0
    let hitTestFrame = 0
    let targetX = -100
    let targetY = -100
    let ringX = -100
    let ringY = -100
    let labelX = -100
    let labelY = -100

    const stopLoop = () => {
      if (!frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    const stopHitTest = () => {
      if (!hitTestFrame) return
      window.cancelAnimationFrame(hitTestFrame)
      hitTestFrame = 0
    }

    const hideCursor = () => {
      root.dataset.cursorVisible = "false"
      cursor.dataset.interactive = "false"
      cursor.dataset.label = ""
      cursorLabel.textContent = ""
      stopLoop()
      stopHitTest()
    }

    const renderFollower = () => {
      ringX += (targetX - ringX) * 0.16
      ringY += (targetY - ringY) * 0.16
      labelX += (targetX + 16 - labelX) * 0.24
      labelY += (targetY + 16 - labelY) * 0.24

      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      cursorLabel.style.transform = `translate3d(${labelX}px, ${labelY}px, 0)`

      const isSettled =
        Math.abs(targetX - ringX) < 0.12 &&
        Math.abs(targetY - ringY) < 0.12 &&
        Math.abs(targetX + 16 - labelX) < 0.12 &&
        Math.abs(targetY + 16 - labelY) < 0.12

      if (isSettled) {
        frame = 0
        return
      }

      frame = window.requestAnimationFrame(renderFollower)
    }

    const startLoop = () => {
      if (!frame) frame = window.requestAnimationFrame(renderFollower)
    }

    const syncEnhancement = () => {
      enhanced = finePointer.matches && !reducedMotion.matches
      if (enhanced) {
        root.dataset.pointerEnhanced = "true"
        return
      }

      delete root.dataset.pointerEnhanced
      hideCursor()
    }

    const syncCursorTarget = (element: Element) => {
      const labelTarget = element.closest<HTMLElement>("[data-cursor]")
      const interactiveTarget = element.closest("a, button, [role='button']")
      const label = labelTarget?.dataset.cursor ?? ""

      cursor.dataset.label = label
      cursor.dataset.interactive = interactiveTarget ? "true" : "false"
      cursorLabel.textContent = label
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!enhanced || document.hidden || !(event.target instanceof Element)) return
      if (!root.contains(event.target)) {
        hideCursor()
        return
      }

      const wasVisible = root.dataset.cursorVisible === "true"
      targetX = event.clientX
      targetY = event.clientY
      cursorCore.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`

      if (!wasVisible) {
        ringX = targetX
        ringY = targetY
        labelX = targetX + 16
        labelY = targetY + 16
      }

      syncCursorTarget(event.target)
      root.dataset.cursorVisible = "true"
      startLoop()
    }

    const handleScroll = () => {
      if (
        !enhanced ||
        document.hidden ||
        root.dataset.cursorVisible !== "true" ||
        hitTestFrame
      ) {
        return
      }

      hitTestFrame = window.requestAnimationFrame(() => {
        hitTestFrame = 0
        const element = document.elementFromPoint(targetX, targetY)

        if (!element || !root.contains(element)) {
          hideCursor()
          return
        }

        syncCursorTarget(element)
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") hideCursor()
    }

    syncEnhancement()
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("blur", hideCursor)
    document.documentElement.addEventListener("mouseleave", hideCursor)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    finePointer.addEventListener("change", syncEnhancement)
    reducedMotion.addEventListener("change", syncEnhancement)

    return () => {
      stopLoop()
      stopHitTest()
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("blur", hideCursor)
      document.documentElement.removeEventListener("mouseleave", hideCursor)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      finePointer.removeEventListener("change", syncEnhancement)
      reducedMotion.removeEventListener("change", syncEnhancement)
      delete root.dataset.pointerEnhanced
      delete root.dataset.cursorVisible
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "paper" ? "signal" : "paper"
    setTheme(nextTheme)
    window.localStorage.setItem("hung-portfolio-concept-theme", nextTheme)
  }

  return (
    <div ref={rootRef} className={`${bricolage.variable} ${styles.concept}`} data-theme={theme}>
      <div className={styles.atmosphere} aria-hidden="true" />
      <div
        ref={cursorRef}
        className={styles.cursorSystem}
        data-label=""
        data-interactive="false"
        aria-hidden="true"
      >
        <span ref={cursorCoreRef} className={styles.cursorCore} />
        <span ref={cursorRingRef} className={styles.cursorRing} />
        <span ref={cursorLabelRef} className={styles.cursorLabel} />
      </div>

      <header className={styles.navShell}>
        <a className={styles.wordmark} href="#top">
          HN<span>/26</span>
        </a>

        <nav className={styles.threadNav} aria-label="Section progress">
          <div className={styles.threadLine} aria-hidden="true">
            <motion.span style={{ scaleX: progress }} />
          </div>

          {THREAD_SECTIONS.map((section, index) => {
            const isActive = index === activeSection
            const isPassed = index <= activeSection

            return (
              <a
                key={section.id}
                className={styles.threadItem}
                href={`#${section.id}`}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "location" : undefined}
                data-active={isActive ? "true" : "false"}
                data-passed={isPassed ? "true" : "false"}
              >
                <span className={styles.threadNumber}>{section.index}</span>
                <span className={styles.threadLabel}>{section.label}</span>
                <span className={styles.threadNode} aria-hidden="true" />
              </a>
            )
          })}
        </nav>

        <button
          className={styles.themeSwitch}
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "paper" ? "signal" : "paper"} theme`}
          aria-pressed={theme === "signal"}
        >
          <span>Paper</span>
          <span className={styles.switchTrack} aria-hidden="true">
            <span />
          </span>
          <span>Signal</span>
        </button>
      </header>

      <main>
        <section id="top" className={styles.hero} data-thread-section>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroOrb} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <HeroThreadField theme={theme} className={styles.heroThreadField} />

          <motion.h1 aria-label="I build AI products that move.">
            <motion.span
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 48, clipPath: "inset(100% 0 0 0)" }
              }
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: 0.86, delay: 0.14, ease: HERO_EASE }}
            >
              I build
            </motion.span>
            <motion.span
              className={styles.heroOutline}
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 48, clipPath: "inset(100% 0 0 0)" }
              }
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: 0.86, delay: 0.21, ease: HERO_EASE }}
            >
              AI products
            </motion.span>
            <motion.span
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 48, clipPath: "inset(100% 0 0 0)" }
              }
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: 0.86, delay: 0.28, ease: HERO_EASE }}
            >
              that move.
            </motion.span>
          </motion.h1>

          <motion.div
            className={styles.heroBottom}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, delay: 0.42, ease: HERO_EASE }}
          >
            <p>
              I turn ambiguous problems into products people use—from early
              research and interface decisions to deployment and growth.
            </p>
            <a href="#work" data-cursor="Scroll">
              Selected work
              <span aria-hidden="true">↓</span>
            </a>
          </motion.div>
        </section>

        <section className={styles.proofStrip} aria-label="Selected outcomes">
          {CONCEPT_HERO_PROOFS.map((proof) => (
            <div key={proof.label}>
              <strong>{proof.value}</strong>
              <span>{proof.label}</span>
            </div>
          ))}
        </section>

        <section id="work" className={styles.workSection} data-thread-section>
          <div className={styles.sectionHeading}>
            <h2>
              Products shipped
              <br />
              <em>into the world.</em>
            </h2>
          </div>

          <DeferredWorkWorld theme={theme} />

          <div className={styles.archive}>
            <div className={styles.archiveHeading}>
              <span>More experiments / contributions</span>
              <span>{String(archiveProjects.length).padStart(2, "0")} projects</span>
            </div>
            {archiveProjects.map((project, index) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Open"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{project.name}</strong>
                <span>{project.role}</span>
                <span>{project.metric}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section id="story" className={styles.storySection} data-thread-section>
          <div className={styles.storyIntro}>
            <h2>
              I don&apos;t collect titles.
              <br />
              <em>I collect proof.</em>
            </h2>
            <p>
              The through-line is simple: understand the system, find the
              leverage, and stay close enough to the work to ship it.
            </p>
          </div>

          <div className={styles.milestones}>
            {CONCEPT_STORY_MILESTONES.map((milestone) => (
              <article key={milestone.title}>
                <div>
                  <time>{milestone.date}</time>
                </div>
                <h3>{milestone.title}</h3>
                <p>{milestone.body}</p>
                <strong>{milestone.signal}</strong>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className={styles.contactSection} data-thread-section>
          <p>Have a difficult product problem?</p>
          <a
            className={styles.contactLink}
            href="mailto:hungng.forwork@gmail.com"
            data-cursor="Email"
          >
            Let&apos;s build
            <br />
            something useful. <span aria-hidden="true">↗</span>
          </a>

          <footer>
            <span>© 2026 Hung Nguyen</span>
            <div>
              <a
                href="https://www.linkedin.com/in/hwnguyxn/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/hungnq74"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
            <span>HCMC · Vietnam</span>
          </footer>
        </section>
      </main>
    </div>
  )
}
