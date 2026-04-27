"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, MotionValue, useMotionValue } from "framer-motion"
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

  const PLATEAU = SEG * 0.15 // 15% of the segment is a flat "perfectly active" zone

  if (index === 0) {
    // First card: starts active at 0 progress and holds for PLATEAU
    finalInputRange = [0, PLATEAU, SEG]
    finalScaleRange = [1, 1, 0.85]
    finalOpacityRange = [1, 1, 0.4]
  } else if (index === N - 1) {
    // Last card: holds active for PLATEAU before the end
    finalInputRange = [1 - SEG, 1 - PLATEAU, 1]
    finalScaleRange = [0.85, 1, 1]
    finalOpacityRange = [0.4, 1, 1]
  } else {
    // Middle cards: active plateau in the center
    finalInputRange = [
      centerAt - SEG,
      centerAt - PLATEAU,
      centerAt + PLATEAU,
      centerAt + SEG,
    ]
    finalScaleRange = [0.85, 1, 1, 0.85]
    finalOpacityRange = [0.4, 1, 1, 0.4]
  }
  
  const scale   = useTransform(scrollYProgress, finalInputRange, finalScaleRange)
  // Removed opacity animation to fix WebKit rendering bugs and match authentic Apple horizontal carousels

  return (
    <motion.div
      style={{
        flexShrink:           0,
        width:                `${CARD_VW}vw`,
        height:               "70vh",
        scale,
        willChange:           "transform",
        background:           "rgba(255,255,255,0.4)",
        backdropFilter:       "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border:               "1px solid rgba(255,255,255,0.6)",
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
            <p className="font-sans text-[11px] uppercase tracking-widest text-slate-600 font-medium">
              {project.role} · {project.metric}
            </p>
            <h2
              className="font-serif text-slate-900 leading-[1.05]"
              style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
            >
              {project.name}
            </h2>
            <p
              className="font-sans text-slate-800 leading-relaxed max-w-sm"
              style={{ fontSize: "clamp(15px, 1.5vw, 18px)", fontWeight: 400 }}
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

        {/* Right — Living Aura Placeholder */}
        <div className="m-6 md:m-8 rounded-[2rem] overflow-hidden relative flex-1">
          <AuraPlaceholder colors={project.colors} />
        </div>
      </div>
    </motion.div>
  )
}

function AuraPlaceholder({ colors }: { colors: string[] }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <div 
      className="absolute inset-0 cursor-pointer group bg-slate-50"
      onMouseMove={handleMouseMove}
    >
      {/* Base colors for the fluid mesh */}
      <motion.div 
        className="absolute w-[150%] h-[150%] rounded-full mix-blend-multiply blur-[60px] opacity-70"
        style={{ background: `radial-gradient(circle, ${colors[0]}, transparent 60%)` }}
        animate={{
          x: ["-20%", "10%", "-20%"],
          y: ["-20%", "10%", "-20%"],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute w-[120%] h-[120%] rounded-full mix-blend-multiply blur-[60px] opacity-60"
        style={{ background: `radial-gradient(circle, ${colors[1]}, transparent 60%)`, top: "20%", left: "40%" }}
        animate={{
          x: ["10%", "-20%", "10%"],
          y: ["10%", "-10%", "10%"],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute w-[140%] h-[140%] rounded-full mix-blend-multiply blur-[60px] opacity-70"
        style={{ background: `radial-gradient(circle, ${colors[2]}, transparent 60%)`, top: "-10%", left: "10%" }}
        animate={{
          x: ["-10%", "20%", "-10%"],
          y: ["20%", "-10%", "20%"],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* Mouse follower orb (reacts on hover) */}
      <motion.div 
        className="absolute w-64 h-64 rounded-full blur-[40px] opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colors[0]}, transparent 70%)`,
          x: useTransform(mouseX, x => x - 128),
          y: useTransform(mouseY, y => y - 128),
        }}
      />
      
      {/* Subtle glass reflection overlay to make it look embedded */}
      <div className="absolute inset-0 border border-white/40 rounded-[2rem] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </div>
  )
}

// Dot-indicator showing which card is active
function DotNav({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  return (
    <div className="flex gap-2 items-center">
      {PROJECTS.map((_, i) => {
        const SEG      = 1 / (N - 1)
        const centerAt = i * SEG
        const PLATEAU = SEG * 0.15
        let dotInputRange: number[]
        if (i === 0) {
          dotInputRange = [0, PLATEAU, SEG * 0.5]
        } else if (i === N - 1) {
          dotInputRange = [1 - SEG * 0.5, 1 - PLATEAU, 1]
        } else {
          dotInputRange = [
            centerAt - SEG * 0.5,
            centerAt - PLATEAU,
            centerAt + PLATEAU,
            centerAt + SEG * 0.5
          ]
        }
        
        // Define outputs that match the length of the ranges
        const opacityRange = i === 0 || i === N - 1 ? [1, 1, 0.3] : [0.3, 1, 1, 0.3]
        if (i === N - 1) opacityRange.reverse()
        
        const widthRange = i === 0 || i === N - 1 ? [24, 24, 6] : [6, 24, 24, 6]
        if (i === N - 1) widthRange.reverse()

        const opacity  = useTransform(scrollYProgress, dotInputRange, opacityRange)
        const width = useTransform(scrollYProgress, dotInputRange, widthRange)
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
