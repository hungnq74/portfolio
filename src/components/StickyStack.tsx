"use client"
import { useRef } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion"
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
      className="h-[clamp(560px,70vh,760px)] md:h-[70vh]"
      style={{
        flexShrink:           0,
        width:                `${CARD_VW}vw`,
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
      <div className="grid h-full grid-rows-[1fr_auto] md:grid-cols-2 md:grid-rows-1">
        {/* Left — copy */}
        <div className="flex min-h-0 flex-col justify-between px-8 py-8 md:px-14 md:py-12">
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
            Explore <span className="text-base">↗</span>
          </a>
        </div>

        {/* Right — cursor-reactive visual artifact */}
        <div className="relative mx-6 mb-6 aspect-[4/3] overflow-hidden rounded-[2rem] md:m-8 md:aspect-auto">
          <ProjectVisual project={project} />
        </div>
      </div>
    </motion.div>
  )
}

type LensKind = Project["visual"]["lens"]

interface LensPreset {
  path: string
  innerPath: string
  highlight: [number, number]
  rotate: number
  scale: number
  duration: number
}

const LENS_PRESETS: Record<LensKind, LensPreset> = {
  drop: {
    path: "M51 5 C66 13 84 31 86 51 C88 75 68 92 45 88 C22 84 9 64 15 42 C20 25 36 10 51 5 Z",
    innerPath: "M50 27 C62 32 70 45 67 58 C63 73 47 80 34 72 C23 65 23 49 33 38 C38 32 43 28 50 27 Z",
    highlight: [35, 24],
    rotate: -6,
    scale: 1.02,
    duration: 15,
  },
  petal: {
    path: "M20 58 C14 31 34 11 61 15 C82 19 91 40 80 61 C68 84 38 92 24 75 C20 70 18 64 20 58 Z",
    innerPath: "M36 63 C31 46 43 31 61 32 C72 33 79 44 75 57 C70 72 50 79 40 70 C38 68 36 66 36 63 Z",
    highlight: [63, 25],
    rotate: 9,
    scale: 1,
    duration: 17,
  },
  leaf: {
    path: "M13 58 C27 24 58 10 86 25 C78 61 52 86 17 79 C11 73 10 65 13 58 Z",
    innerPath: "M28 61 C38 42 58 31 75 35 C66 58 48 73 26 72 C23 69 24 65 28 61 Z",
    highlight: [65, 30],
    rotate: -12,
    scale: 1.04,
    duration: 16,
  },
  heart: {
    path: "M50 86 C29 72 15 58 16 38 C17 20 38 16 50 32 C63 15 84 22 84 41 C84 61 68 74 50 86 Z",
    innerPath: "M50 67 C38 59 30 50 31 39 C32 30 43 29 50 38 C58 29 70 33 70 43 C70 54 61 61 50 67 Z",
    highlight: [42, 28],
    rotate: 3,
    scale: 0.96,
    duration: 18,
  },
  orbit: {
    path: "M19 62 C14 41 27 20 50 14 C75 8 94 25 89 49 C84 76 53 93 29 80 C24 77 20 70 19 62 Z",
    innerPath: "M34 59 C31 47 39 35 52 32 C65 30 76 39 74 52 C71 66 54 75 41 68 C37 66 35 63 34 59 Z",
    highlight: [31, 27],
    rotate: 14,
    scale: 1.02,
    duration: 19,
  },
  ripple: {
    path: "M18 52 C17 30 38 15 61 20 C82 24 93 43 85 64 C76 87 45 92 26 76 C20 71 17 62 18 52 Z",
    innerPath: "M34 52 C34 41 45 34 57 36 C68 38 74 48 70 59 C65 70 49 73 40 65 C36 62 34 57 34 52 Z",
    highlight: [58, 24],
    rotate: -3,
    scale: 1.01,
    duration: 15,
  },
  blossom: {
    path: "M50 11 C60 25 79 20 85 38 C72 44 79 66 62 74 C54 61 33 76 22 60 C34 51 21 32 38 23 C43 26 47 20 50 11 Z",
    innerPath: "M51 36 C58 42 66 41 69 49 C63 53 65 62 57 65 C52 60 43 66 38 59 C44 55 39 46 47 42 C49 42 50 39 51 36 Z",
    highlight: [48, 22],
    rotate: 8,
    scale: 1.03,
    duration: 20,
  },
  terrain: {
    path: "M15 66 C21 37 43 17 69 19 C88 21 92 43 82 62 C69 87 34 91 18 78 C14 75 13 70 15 66 Z",
    innerPath: "M30 65 C36 48 50 37 66 38 C76 39 79 50 72 61 C63 74 42 78 32 71 C30 69 29 67 30 65 Z",
    highlight: [38, 29],
    rotate: -9,
    scale: 1.01,
    duration: 18,
  },
  network: {
    path: "M16 55 C18 31 40 15 63 19 C86 23 91 46 80 66 C68 88 36 89 20 72 C16 68 14 61 16 55 Z",
    innerPath: "M32 55 C34 42 46 34 59 36 C70 38 74 49 68 60 C61 71 44 71 36 63 C33 61 31 58 32 55 Z",
    highlight: [60, 28],
    rotate: 6,
    scale: 1.02,
    duration: 17,
  },
}

function LensMotif({ lens, accent }: { lens: LensKind; accent: string }) {
  if (lens === "ripple") {
    return (
      <g fill="none" stroke="white" strokeWidth="0.55" opacity="0.3">
        <ellipse cx="52" cy="55" rx="14" ry="9" />
        <ellipse cx="52" cy="55" rx="25" ry="16" />
        <ellipse cx="52" cy="55" rx="36" ry="23" />
      </g>
    )
  }

  if (lens === "terrain") {
    return (
      <g fill="none" stroke="white" strokeWidth="0.5" opacity="0.26">
        <path d="M22 65 C36 55 44 57 55 48 C65 40 72 42 82 35" />
        <path d="M24 74 C39 63 51 65 63 55 C72 48 78 50 86 44" />
        <path d="M20 55 C33 47 42 48 53 39 C62 31 70 32 79 26" />
      </g>
    )
  }

  if (lens === "orbit") {
    return (
      <g fill="none" stroke="white" strokeWidth="0.55" opacity="0.28">
        <path d="M21 61 C37 38 61 27 86 31" />
        <path d="M16 67 C39 55 61 56 82 72" />
        <circle cx="75" cy="34" r="1.2" fill={accent} stroke="none" opacity="0.75" />
      </g>
    )
  }

  if (lens === "network") {
    return (
      <g opacity="0.32">
        <path d="M28 60 C40 46 55 45 70 36" fill="none" stroke="white" strokeWidth="0.5" />
        <path d="M38 71 C47 57 58 58 74 65" fill="none" stroke="white" strokeWidth="0.5" />
        {[28, 44, 61, 73].map((cx, index) => (
          <circle key={cx} cx={cx} cy={[60, 50, 43, 64][index]} r="1.15" fill="white" />
        ))}
      </g>
    )
  }

  if (lens === "blossom") {
    return (
      <g fill="none" stroke="white" strokeWidth="0.5" opacity="0.25">
        <path d="M50 26 C47 41 40 52 27 62" />
        <path d="M50 27 C56 41 65 51 77 58" />
        <path d="M49 34 C50 46 52 56 58 68" />
      </g>
    )
  }

  return (
    <g fill="none" stroke="white" strokeWidth="0.55" opacity="0.24">
      <path d="M25 63 C38 52 48 43 62 29" />
      <path d="M34 68 C43 56 52 50 73 43" />
    </g>
  )
}

function ProjectVisual({ project }: { project: Project }) {
  const accent = project.visual.accent
  const preset = LENS_PRESETS[project.visual.lens]
  const safeId = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const mouseX = useMotionValue(9999)
  const mouseY = useMotionValue(9999)
  const parallaxX = useMotionValue(0)
  const parallaxY = useMotionValue(0)
  const lensOpacity = useMotionValue(0)
  const cursorGlow = useMotionTemplate`radial-gradient(circle 260px at ${mouseX}px ${mouseY}px, ${accent}59, transparent 68%)`
  const inverseParallaxX = useTransform(parallaxX, (value) => value * -0.5)
  const inverseParallaxY = useTransform(parallaxY, (value) => value * -0.5)
  const lensX = useTransform(parallaxX, (value) => value * 0.78)
  const lensY = useTransform(parallaxY, (value) => value * 0.78)
  const motifX = useTransform(parallaxX, (value) => value * 0.45)
  const motifY = useTransform(parallaxY, (value) => value * 0.45)
  const glowX = useTransform(mouseX, (x) => x - 112)
  const glowY = useTransform(mouseY, (y) => y - 112)
  const gradientId = `${safeId}-lens-gradient`
  const bloomId = `${safeId}-lens-bloom`

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    mouseX.set(x)
    mouseY.set(y)
    parallaxX.set((x / rect.width - 0.5) * 14)
    parallaxY.set((y / rect.height - 0.5) * 14)
    lensOpacity.set(1)
  }

  function handleMouseLeave() {
    lensOpacity.set(0)
    parallaxX.set(0)
    parallaxY.set(0)
  }

  return (
    <div
      className="absolute inset-0 cursor-pointer overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: `
          radial-gradient(circle at ${preset.highlight[0]}% ${preset.highlight[1]}%, rgba(255,255,255,0.72), transparent 24%),
          radial-gradient(circle at 22% 82%, ${accent}36, transparent 34%),
          linear-gradient(145deg, rgba(255,255,255,0.3), rgba(226,242,249,0.26) 42%, rgba(220,235,199,0.18))
        `,
        backdropFilter: "blur(16px) saturate(128%)",
        WebkitBackdropFilter: "blur(16px) saturate(128%)",
      }}
    >
      <motion.div
        className="absolute inset-[-18%] opacity-70"
        style={{
          x: inverseParallaxX,
          y: inverseParallaxY,
          background: `
            radial-gradient(circle at 18% 18%, rgba(255,255,255,0.76), transparent 20%),
            radial-gradient(circle at 74% 34%, ${accent}40, transparent 30%),
            radial-gradient(circle at 40% 76%, rgba(186,230,253,0.26), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,0.22), rgba(186,230,253,0.1), rgba(236,252,203,0.12))
          `,
        }}
        animate={{ rotate: [-1.2, 1.2, -1.2], scale: [1, 1.025, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-[8%] rounded-[45%] blur-2xl"
        style={{
          x: parallaxX,
          y: parallaxY,
          background: `radial-gradient(circle at ${preset.highlight[0]}% ${preset.highlight[1]}%, rgba(255,255,255,0.64), ${accent}52 35%, transparent 72%)`,
          opacity: 0.62,
          mixBlendMode: "screen",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.52, 0.7, 0.52] }}
        transition={{ duration: preset.duration, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        className="absolute left-[8%] top-[7%] h-[86%] w-[84%] overflow-visible md:left-[7%] md:top-[6%] md:h-[88%] md:w-[86%]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          x: lensX,
          y: lensY,
          filter: "drop-shadow(0 28px 72px rgba(99,115,129,0.16))",
          mixBlendMode: "screen",
        }}
        animate={{
          rotate: [preset.rotate - 1.2, preset.rotate + 1.2, preset.rotate - 1.2],
          scale: [preset.scale, preset.scale + 0.025, preset.scale],
        }}
        transition={{ duration: preset.duration, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id={gradientId} cx={`${preset.highlight[0]}%`} cy={`${preset.highlight[1]}%`} r="82%">
            <stop offset="0%" stopColor="white" stopOpacity="0.88" />
            <stop offset="32%" stopColor={accent} stopOpacity="0.34" />
            <stop offset="68%" stopColor={accent} stopOpacity="0.16" />
            <stop offset="100%" stopColor="white" stopOpacity="0.08" />
          </radialGradient>
          <radialGradient id={bloomId} cx={`${preset.highlight[0]}%`} cy={`${preset.highlight[1]}%`} r="42%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="70%" stopColor={accent} stopOpacity="0.24" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={preset.path} fill={`url(#${gradientId})`} opacity="0.95" />
        <path d={preset.path} fill="none" stroke={accent} strokeWidth="0.6" strokeOpacity="0.28" />
        <path d={preset.innerPath} fill={accent} opacity="0.2" />
        <path d={preset.innerPath} fill="rgba(255,255,255,0.24)" opacity="0.9" />
        <ellipse
          cx={preset.highlight[0]}
          cy={preset.highlight[1]}
          rx="16"
          ry="9"
          fill={`url(#${bloomId})`}
          opacity="0.72"
          transform={`rotate(${preset.rotate} ${preset.highlight[0]} ${preset.highlight[1]})`}
        />
      </motion.svg>

      <motion.svg
        className="pointer-events-none absolute left-[8%] top-[7%] h-[86%] w-[84%] overflow-visible opacity-80 md:left-[7%] md:top-[6%] md:h-[88%] md:w-[86%]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ x: motifX, y: motifY, mixBlendMode: "screen" }}
      >
        <LensMotif lens={project.visual.lens} accent={accent} />
      </motion.svg>

      <motion.div
        className="absolute inset-0 opacity-0 mix-blend-screen"
        style={{
          opacity: lensOpacity,
          background: cursorGlow,
        }}
      />

      <motion.div
        className="pointer-events-none absolute h-56 w-56 rounded-full opacity-0 blur-3xl"
        style={{
          x: glowX,
          y: glowY,
          opacity: lensOpacity,
          background: `radial-gradient(circle, rgba(255,255,255,0.76), ${accent}66 38%, transparent 70%)`,
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.48), transparent 24%, transparent 62%, rgba(255,255,255,0.2))",
        }}
        animate={{
          x: ["-10%", "4%", "-10%"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 border border-white/40 rounded-[2rem] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/12 via-transparent to-white/10 pointer-events-none" />
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
