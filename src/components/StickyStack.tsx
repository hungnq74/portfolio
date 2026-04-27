"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { PROJECTS, Project } from "@/lib/projects"

const N        = PROJECTS.length   // 9 cards
const CARD_VW  = 80                // each card: 80vw wide
const GAP_VW   = 5                 // gap between cards: 5vw
const STEP_VW  = CARD_VW + GAP_VW // 85vw per step
const START_X  = (100 - CARD_VW) / 2          // 10vw — centers first card
const END_X    = START_X - (N - 1) * STEP_VW  // centers last card

interface CardProps {
  project: Project
  index: number
  scrollYProgress: MotionValue<number>
}

function ProjectCard({ project, index, scrollYProgress }: CardProps) {
  const SEG       = 1 / (N - 1)
  const centerAt  = index * SEG
  // Define clean ranges for the first, last, and middle cards
  // This avoids negative offsets and duplicates that crash the Web Animations API
  let finalInputRange: number[]
  let finalScaleRange: number[]
  let finalOpacityRange: number[]

  if (index === 0) {
    // First card: starts active at 0 progress
    finalInputRange = [0, SEG]
    finalScaleRange = [1, 0.85]
    finalOpacityRange = [1, 0.4]
  } else if (index === N - 1) {
    // Last card: ends active at 1 progress
    finalInputRange = [1 - SEG, 1]
    finalScaleRange = [0.85, 1]
    finalOpacityRange = [0.4, 1]
  } else {
    // Middle cards: active when scroll position matches their index
    finalInputRange = [centerAt - SEG, centerAt, centerAt + SEG]
    finalScaleRange = [0.85, 1, 0.85]
    finalOpacityRange = [0.4, 1, 0.4]
  }
  
  const scale   = useTransform(scrollYProgress, finalInputRange, finalScaleRange)
  const opacity = useTransform(scrollYProgress, finalInputRange, finalOpacityRange)

  return (
    <motion.div
      style={{
        flexShrink:           0,
        width:                `${CARD_VW}vw`,
        height:               "70vh",
        scale,
        opacity,
        background:           "rgba(255,255,255,0.1)",
        backdropFilter:       "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border:               "1px solid rgba(255,255,255,0.22)",
        borderRadius:         "2.5rem",
        boxShadow:            "0 25px 50px -12px rgba(0,0,0,0.15)",
        overflow:             "hidden",
        transformOrigin:      "center center",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Left — copy */}
        <div className="flex flex-col justify-between px-10 py-10 md:px-14 md:py-12">
          <div className="flex flex-col gap-4">
            <p className="font-sans text-[11px] uppercase tracking-widest text-slate-500">
              {project.role} · {project.metric}
            </p>
            <h2
              className="font-serif text-slate-900 leading-[1.05]"
              style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
            >
              {project.name}
            </h2>
            <p
              className="font-sans font-light text-slate-700 leading-relaxed max-w-sm"
              style={{ fontSize: "clamp(15px, 1.5vw, 18px)" }}
            >
              {project.highlight}
            </p>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 mt-4 w-fit"
          >
            View project <span className="text-base">↗</span>
          </a>
        </div>

        {/* Right — asset placeholder */}
        <div
          className="m-6 md:m-8 rounded-2xl flex items-center justify-center"
          style={{
            background:           "rgba(255,255,255,0.18)",
            backdropFilter:       "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border:               "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <span className="font-sans text-[11px] uppercase tracking-widest text-slate-400">
            Asset Placeholder
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Dot-indicator showing which card is active
function DotNav({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  return (
    <div className="flex gap-2 items-center">
      {PROJECTS.map((_, i) => {
        const SEG      = 1 / (N - 1)
        const centerAt = i * SEG
        const opacity  = useTransform(
          scrollYProgress,
          [Math.max(0, centerAt - SEG * 0.5), centerAt, Math.min(1, centerAt + SEG * 0.5)],
          [0.3, 1, 0.3],
        )
        const width = useTransform(
          scrollYProgress,
          [Math.max(0, centerAt - SEG * 0.5), centerAt, Math.min(1, centerAt + SEG * 0.5)],
          [6, 24, 6],
        )
        return (
          <motion.div
            key={i}
            style={{
              opacity,
              width,
              height:       6,
              borderRadius: 9999,
              background:   "rgba(15,23,42,0.6)",
              flexShrink:   0,
            }}
          />
        )
      })}
    </div>
  )
}

export function StickyStack() {
  const ref = useRef<HTMLDivElement>(null)

  // Use Framer Motion's built-in useScroll. 
  // It handles all the complex absolute positioning, resize observers, and scroll syncing perfectly.
  // "start start" = progress is 0 when the top of the container hits the top of the viewport
  // "end end" = progress is 1 when the bottom of the container hits the bottom of the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  // Drive the whole strip horizontally: first card centred → last card centred
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [`${START_X}vw`, `${END_X}vw`],
  )

  return (
    <div ref={ref} style={{ height: `${N * 100}vh`, marginTop: "50vh" }}>
      {/* 
        h-screen + sticky top-0 ensures the container locks to the screen 
        for the entire duration of the scrolling.
      */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center gap-8 w-full">

        {/* Horizontal card strip */}
        <motion.div
          style={{
            x,
            display:    "flex",
            gap:        `${GAP_VW}vw`,
            alignItems: "center",
            width:      "max-content",
            willChange: "transform",
          }}
        >
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.name}
              project={project}
              index={i}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </motion.div>

        {/* Dot navigation */}
        <div
          className="flex flex-col items-center gap-3 w-full"
          style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)" }}
        >
          <DotNav scrollYProgress={scrollYProgress} />
          <p className="font-sans text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            scroll to explore
          </p>
        </div>
      </div>
    </div>
  )
}
