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

  const introOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const x = useTransform(scrollYProgress, [0.1, 0.9], ["0vw", "-270vw"])

  return (
    <div ref={ref} style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Intro headline */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <p
            className="font-serif text-slate-900 text-center leading-tight px-8"
            style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
          >
            I don't wait for permission.
            <br />
            <em>I build.</em>
          </p>
        </motion.div>

        {/* Horizontal strip */}
        <div className="absolute inset-0 flex items-center">
          <motion.div
            style={{ x, width: "350vw" }}
            className="flex items-center"
          >
            {/* Connecting line */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-px"
              style={{
                width: "350vw",
                background: "rgba(255,255,255,0.3)",
                left: 0,
              }}
            />

            {NODES.map((node, i) => (
              <div
                key={node.year}
                className="relative flex-none flex flex-col items-start justify-center px-16"
                style={{ width: "87.5vw" }}
              >
                {/* Year pill */}
                <div
                  className="mb-6 px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <span
                    className="font-mono text-slate-700 uppercase tracking-widest"
                    style={{ fontSize: "11px" }}
                  >
                    {node.year}
                  </span>
                </div>

                {/* Dot on line */}
                <div
                  className="absolute left-16 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-700"
                  style={{ marginTop: "-1px" }}
                />

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
                  style={{ fontSize: "clamp(14px, 1.4vw, 17px)" }}
                >
                  {node.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
