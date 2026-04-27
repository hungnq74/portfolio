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

export function HorizontalTimeline() {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-350vw"])

  return (
    <div ref={ref} style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Horizontal strip */}
        <div className="absolute inset-0 flex items-center">
          <motion.div
            style={{ x, width: "440vw" }}
            className="flex items-center h-full"
          >
            {/* Connecting line — start after the first 100vw so it doesn't cross the intro text */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-[1px]"
              style={{
                width: "340vw",
                background: "rgba(15,23,42,0.15)",
                left: "100vw",
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
            {NODES.map((node, i) => (
              <div
                key={node.year}
                className="relative flex-none h-full"
                style={{ width: "85vw" }}
              >
                {/* Dot on line */}
                <div
                  className="absolute left-16 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-800"
                />

                {/* Content placed alternating ABOVE or BELOW the line */}
                <div 
                  className={`absolute left-16 flex flex-col items-start pr-16 max-w-2xl ${
                    i % 2 === 0 
                      ? "top-1/2 -translate-y-full pb-10" 
                      : "top-1/2 pt-10"
                  }`}
                >
                  {/* Year pill */}
                  <div
                    className="mb-5 px-4 py-1.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.4)",
                      backdropFilter: "saturate(180%) blur(20px)",
                      WebkitBackdropFilter: "saturate(180%) blur(20px)",
                      border: "1px solid rgba(255,255,255,0.6)",
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
                    className="font-serif text-slate-900 leading-tight mb-4"
                    style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
                  >
                    {node.headline}
                  </h3>

                  {/* Description */}
                  <p
                    className="font-sans font-light text-slate-700 leading-relaxed max-w-sm"
                    style={{ fontSize: "clamp(15px, 1.4vw, 17px)" }}
                  >
                    {node.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
