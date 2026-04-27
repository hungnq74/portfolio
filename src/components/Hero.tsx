"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function Hero() {
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Scale up like a portal, fade out before fully exiting
  const scale = useTransform(scrollYProgress, [0, 1], [1, 5])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section ref={ref} className="relative h-screen">
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <motion.div
          style={{ scale, opacity }}
          className="max-w-2xl text-center"
        // pill card
        >
          <div
            className="px-10 py-10 rounded-[2rem] shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.28)",
            }}
          >
            <h1
              className="font-serif text-slate-900 leading-[1.05] mb-5"
              style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
            >
              Hung Nguyen.
            </h1>
            <p
              className="font-sans font-light text-slate-700 leading-relaxed"
              style={{ fontSize: "clamp(16px, 2vw, 20px)" }}
            >
              22 | building stuffs
              <br />
              architecting the world
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
