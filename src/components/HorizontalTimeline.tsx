"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const NODES = [
  {
    year: "2021",
    headline: "The Graduate",
    description:
      "Studied Information Systems and came out with one conviction: the fastest path from idea to impact is building it yourself.",
  },
  {
    year: "2022",
    headline: "Series A at 21",
    description:
      "Joined Al Hay as AI Product Owner while still a student. Led product domains that reached 300K monthly active users before I turned 22.",
  },
  {
    year: "2023",
    headline: "8 Products Shipped",
    description:
      "Across VNG, solo experiments, and startup bets — eight products in two years. Each one a lesson in what the market actually wants.",
  },
  {
    year: "2024 →",
    headline: "Solo Founder",
    description:
      "Launched Dreamify. No co-founder. No permission. Just product intuition and AI as leverage.",
  },
]

const INTRO_WIDTH_VW = 100
const NODE_WIDTH_VW = 100
const TRACK_WIDTH_VW = INTRO_WIDTH_VW + NODES.length * NODE_WIDTH_VW
const SCROLL_DISTANCE_VW = NODES.length * NODE_WIDTH_VW

export function HorizontalTimeline() {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${SCROLL_DISTANCE_VW}vw`])
  const lineTop = "calc(50% + clamp(150px, 18vh, 190px))"

  return (
    <div ref={ref} style={{ height: `${NODES.length + 1}00vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Horizontal strip */}
        <div className="absolute inset-0 flex items-center">
          <motion.div
            style={{ x, width: `${TRACK_WIDTH_VW}vw` }}
            className="flex items-center h-full"
          >
            {/* Connecting line — start after the first 100vw so it doesn't cross the intro text */}
            <div
              className="absolute -translate-y-1/2 h-[1px]"
              style={{
                top: lineTop,
                width: `${SCROLL_DISTANCE_VW}vw`,
                background: "rgba(15,23,42,0.15)",
                left: `${INTRO_WIDTH_VW}vw`,
              }}
            />

            {/* Intro node (Slide 1) */}
            <div className="w-[100vw] h-screen flex flex-none items-center justify-center">
              <p
                className="font-serif text-slate-900 text-center leading-tight px-8"
                style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
              >
                I don't wait for permission.
                <br />
                <em>I build.</em>
              </p>
            </div>

            {/* Milestone nodes (Slides 2-5) */}
            {NODES.map((node) => (
              <div
                key={node.year}
                className="relative flex-none h-full"
                style={{ width: `${NODE_WIDTH_VW}vw` }}
              >
                {/* Dot on line */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-800 shadow-[0_0_0_6px_rgba(255,255,255,0.28)]"
                  style={{ top: lineTop }}
                />

                {/* Frosted milestone panel */}
                <div
                  className="absolute left-1/2 top-1/2 w-[calc(100vw-48px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] px-7 py-7 shadow-2xl md:w-[min(520px,42vw)] md:px-9 md:py-8"
                  style={{
                    background: "rgba(255,255,255,0.54)",
                    backdropFilter: "saturate(180%) blur(24px)",
                    WebkitBackdropFilter: "saturate(180%) blur(24px)",
                    border: "1px solid rgba(255,255,255,0.68)",
                    boxShadow: "0 25px 50px -12px rgba(15,23,42,0.22)",
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.48), rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.08))",
                    }}
                  />
                  <div className="relative z-10 flex flex-col items-start">
                    {/* Year pill */}
                    <div
                      className="mb-5 px-4 py-1.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.56)",
                        backdropFilter: "saturate(180%) blur(16px)",
                        WebkitBackdropFilter: "saturate(180%) blur(16px)",
                        border: "1px solid rgba(255,255,255,0.72)",
                      }}
                    >
                      <span
                        className="font-mono text-slate-800 uppercase tracking-widest font-semibold"
                        style={{ fontSize: "11px" }}
                      >
                        {node.year}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3
                      className="font-serif text-slate-900 leading-[1.05] mb-4 max-w-[11ch]"
                      style={{ fontSize: "clamp(34px, 4vw, 48px)" }}
                    >
                      {node.headline}
                    </h3>

                    {/* Description */}
                    <p
                      className="font-sans text-slate-800 leading-relaxed max-w-sm"
                      style={{ fontSize: "clamp(16px, 1.4vw, 18px)", fontWeight: 400 }}
                    >
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
