"use client"
import { motion } from "framer-motion"

export function GlassNav() {
  return (
    <motion.nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-12 px-6 py-3 rounded-full shadow-lg"
      style={{
        maxWidth: 520,
        width: "90vw",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      <span className="font-serif text-xl text-slate-900 leading-none select-none">HQ</span>
      <a
        href="mailto:hungng.forwork@gmail.com"
        className="font-sans text-[13px] text-slate-700 hover:text-slate-900 transition-colors truncate"
      >
        hungng.forwork@gmail.com
      </a>
    </motion.nav>
  )
}
