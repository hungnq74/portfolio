"use client"
import { useRef, useState } from "react"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"

const STORY_STEPS = [
  {
    id: "cosmoagents",
    date: "MAR 2024 – MAR 2025",
    title: "Research → Ship → Revenue",
    body: "I learned the loop at Cosmoagents: research the pain, shape the UX, ship until an AI SaaS turned into real customers.",
    badges: ["5 organic B2B deals"],
    links: [{ label: "cosmoagents.ai", href: "https://cosmoagents.ai/" }],
  },
  {
    id: "vng",
    date: "2024 – 2025",
    title: "Shipped at Scale",
    body: "Then the stakes got real. At VNG, product decisions touched 180K+ users across AI platforms built for production, not pitch decks.",
    badges: ["+200% AI Art requests", "+154% AI-handled CS"],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/hwnguyxn/" }],
  },
  {
    id: "ai-hay-imely",
    date: "OCT 2025 – PRESENT",
    title: "Scale to Venture",
    body: "At AI Hay, I led a 300K MAU domain. At imely.ai, I moved from domain owner to full-stack founder: app, product, and GTM.",
    badges: ["300K MAU → 0→1 founder"],
    links: [
      { label: "ai-hay.vn", href: "https://ai-hay.vn/" },
      { label: "imely.ai", href: "https://imely.ai/" },
    ],
  },
  {
    id: "dreamify",
    date: "OCT 2025 – PRESENT",
    title: "Shipped from Scratch",
    body: "Dreamify is the current proof: an AI analyst for non-tech founders and marketers, shipped from zero with a small team and no paid acquisition.",
    badges: ["200 users / 1K organic visitors"],
    links: [{ label: "dreamify.dev", href: "https://dreamify.dev/" }],
  },
]
const SECTION_HEIGHT = Array.from({ length: 5 }, () => "var(--scroll-viewport)").join(" + ")

type StoryStep = (typeof STORY_STEPS)[number]

function getStepMotionRanges(index: number, total: number) {
  const segment = 1 / total
  const start = index * segment
  const end = (index + 1) * segment

  /*
   * The hand-off is centred on the boundary and shared by both steps: the one
   * leaving and the one arriving run the same window in opposite directions,
   * so their opacities always sum to one and something is always legible.
   *
   * Offsetting those windows instead — as this did before — left both steps
   * near a quarter opacity at the crossover, which read as two blurred copies
   * of the text and nothing to actually look at.
   */
  const handoff = segment * 0.1

  if (index === 0) {
    return {
      input: [0, end - handoff, end + handoff],
      opacity: [1, 1, 0],
      y: [0, 0, -18],
      scale: [1, 1, 0.97],
    }
  }

  if (index === total - 1) {
    return {
      input: [start - handoff, start + handoff, 1],
      opacity: [0, 1, 1],
      y: [24, 0, 0],
      scale: [0.97, 1, 1],
    }
  }

  return {
    input: [start - handoff, start + handoff, end - handoff, end + handoff],
    opacity: [0, 1, 1, 0],
    y: [24, 0, 0, -18],
    scale: [0.97, 1, 1, 0.97],
  }
}

function monotonic(input: number[]) {
  const rising = [...input]
  for (let i = 1; i < rising.length; i += 1) {
    if (rising[i] <= rising[i - 1]) rising[i] = rising[i - 1] + 0.0001
  }
  return rising
}

function interpolate(input: number[], output: number[], value: number) {
  if (value <= input[0]) return output[0]
  if (value >= input[input.length - 1]) return output[output.length - 1]

  for (let i = 0; i < input.length - 1; i += 1) {
    const inputStart = input[i]
    const inputEnd = input[i + 1]

    if (value >= inputStart && value <= inputEnd) {
      const localProgress = (value - inputStart) / (inputEnd - inputStart)
      return output[i] + (output[i + 1] - output[i]) * localProgress
    }
  }

  return output[output.length - 1]
}


function StoryContent({ step }: { step: StoryStep }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-600">
        {step.date}
      </p>

      <h3
        className="mb-6 max-w-[10ch] font-serif leading-[0.98] text-slate-950 md:max-w-[12ch]"
        style={{ fontSize: "clamp(38px, 6vw, 78px)" }}
      >
        {step.title}
      </h3>

      <p
        className="mb-7 max-w-2xl font-sans leading-relaxed text-slate-800"
        style={{ fontSize: "clamp(16px, 1.7vw, 21px)", fontWeight: 400 }}
      >
        {step.body}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {step.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full px-4 py-2 font-sans text-sm font-medium leading-tight text-slate-900"
            style={{
              background: "rgba(255,255,255,0.52)",
              border: "1px solid rgba(255,255,255,0.72)",
            }}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {step.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-950"
          >
            {link.label} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function AnimatedStoryStep({
  step,
  index,
  activeIndex,
  scrollYProgress,
}: {
  step: StoryStep
  index: number
  activeIndex: number
  scrollYProgress: MotionValue<number>
}) {
  const ranges = getStepMotionRanges(index, STORY_STEPS.length)
  const input = monotonic(ranges.input)
  const opacity = useTransform(scrollYProgress, input, ranges.opacity)
  const y = useTransform(scrollYProgress, input, ranges.y)
  const scale = useTransform(scrollYProgress, input, ranges.scale)
  const pointerEvents = index === activeIndex ? "auto" : "none"

  return (
    <motion.article
      className="absolute inset-0"
      style={{ opacity, y, scale, pointerEvents }}
      aria-hidden={index !== activeIndex ? "true" : undefined}
    >
      <StoryContent step={step} />
    </motion.article>
  )
}

function ProgressDot({
  index,
  activeIndex,
}: {
  index: number
  activeIndex: number
}) {
  const isActive = index === activeIndex

  return (
    <motion.div
      className="h-1.5 w-1.5 rounded-full bg-slate-900"
      animate={{ opacity: isActive ? 1 : 0.35, scale: isActive ? 1.35 : 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    />
  )
}

function ProgressRail({
  scrollYProgress,
  activeIndex,
}: {
  scrollYProgress: MotionValue<number>
  activeIndex: number
}) {
  const nextStep = STORY_STEPS[activeIndex + 1]

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(STORY_STEPS.length).padStart(2, "0")}
        </p>

        <motion.div
          key={nextStep?.id ?? "complete"}
          className="max-w-[52vw] text-right sm:max-w-none"
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {nextStep ? "Next" : "Complete"}
          </p>
          <p className="font-sans text-sm font-medium leading-tight text-slate-700">
            {nextStep ? `${nextStep.title} ↓` : "End of proof"}
          </p>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-px flex-1 overflow-hidden rounded-full bg-slate-900/15">
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left bg-slate-900/60"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
        <div className="flex items-center gap-2">
          {STORY_STEPS.map((step, index) => (
            <ProgressDot
              key={step.id}
              index={index}
              activeIndex={activeIndex}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StaticStory() {
  return (
    <section className="px-4 py-28 md:py-36">
      <div
        className="mx-auto w-full max-w-[860px] overflow-hidden rounded-[2rem] px-7 py-8 shadow-2xl md:px-12 md:py-12"
        style={{
          background: "rgba(255,255,255,0.56)",
          backdropFilter: "saturate(180%) blur(26px)",
          WebkitBackdropFilter: "saturate(180%) blur(26px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 25px 50px -12px rgba(15,23,42,0.22)",
        }}
      >
        <p className="mb-8 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Founder story
        </p>
        <div className="space-y-14">
          {STORY_STEPS.map((step) => (
            <article key={step.id}>
              <StoryContent step={step} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HorizontalTimeline() {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  // Only the active step is React state now — it changes a handful of times,
  // where the visual scrub changes every frame and is handled by motion values.
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextIndex = Math.min(
      STORY_STEPS.length - 1,
      Math.max(0, Math.floor(latest * STORY_STEPS.length)),
    )
    setActiveIndex((previous) => (previous === nextIndex ? previous : nextIndex))
  })

  if (reducedMotion) {
    return <StaticStory />
  }

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `calc(${SECTION_HEIGHT})` }}
    >
      <div
        className="sticky top-0 flex items-center justify-center overflow-hidden px-4 py-4 md:py-8"
        style={{ height: "var(--scroll-viewport)" }}
      >
        <div
          className="relative min-h-[var(--timeline-card-min-height)] w-[calc(100vw-32px)] max-w-[860px] overflow-hidden rounded-[2rem] px-6 py-7 shadow-2xl md:px-12 md:py-11"
          style={{
            background: "rgba(255,255,255,0.56)",
            backdropFilter: "saturate(180%) blur(28px)",
            WebkitBackdropFilter: "saturate(180%) blur(28px)",
            border: "1px solid rgba(255,255,255,0.72)",
            boxShadow: "0 25px 50px -12px rgba(15,23,42,0.24)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0.18) 48%, rgba(255,255,255,0.08))",
            }}
          />

          <div className="relative z-10 flex h-full min-h-[inherit] flex-col">
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                Founder story
              </p>
              <p className="hidden font-sans text-sm font-medium text-slate-500 sm:block">
                I don't collect titles. I collect proof.
              </p>
            </div>

            <div className="relative flex-1">
              {STORY_STEPS.map((step, index) => (
                <AnimatedStoryStep
                  key={step.id}
                  step={step}
                  index={index}
                  activeIndex={activeIndex}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>

            <ProgressRail scrollYProgress={scrollYProgress} activeIndex={activeIndex} />
          </div>
        </div>
      </div>
    </section>
  )
}
