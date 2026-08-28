export type ConceptProjectName =
  | "Dreamify"
  | "Imely"
  | "AI Hay"
  | "VNGGames CS"
  | "Cosmoagents"

export type ConceptArtifactKind =
  | "compress"
  | "attract"
  | "unfold"
  | "route"
  | "loop"

export type ConceptInteractionBehavior =
  | "converge-nearest"
  | "attract-nearest"
  | "spread-nearest"
  | "deflect-nearest"
  | "tension-nearest"

export interface ConceptProofMetric {
  value: string
  label: string
  qualifier?: string
  detail?: string
}

export interface ConceptArtifactConfig {
  kind: ConceptArtifactKind
  interaction: ConceptInteractionBehavior
}

export interface ConceptProject {
  index: `${number}`
  slug: string
  name: ConceptProjectName
  url: string
  role: string
  descriptor: string
  summary: string
  proofs: readonly ConceptProofMetric[]
  artifact: ConceptArtifactConfig
}

export interface ConceptStoryMilestone {
  date: string
  title: string
  body: string
  signal: string
}

export const CONCEPT_FEATURED_PROJECTS = [
  {
    index: "01",
    slug: "dreamify",
    name: "Dreamify",
    url: "https://app.dreamify.dev/",
    role: "Founder & CEO",
    descriptor: "Self-funded AI data analyst",
    summary:
      "A self-funded AI data analyst built from zero to early traction for non-technical founders and marketers.",
    proofs: [
      { value: "1,000", label: "new registered users" },
      { value: "≈28M", label: "AI tokens consumed" },
      { value: "≈1,000", label: "conversations created" },
    ],
    artifact: {
      kind: "compress",
      interaction: "converge-nearest",
    },
  },
  {
    index: "02",
    slug: "imely",
    name: "Imely",
    url: "https://imely.ai/",
    role: "Product Development & GTM",
    descriptor: "AI consumer companion",
    summary:
      "Led product development and go-to-market from zero users to meaningful consumer traction and recurring revenue.",
    proofs: [
      {
        value: "150K",
        label: "monthly active users",
        qualifier: "within two months",
      },
      {
        value: "$4K",
        label: "monthly recurring revenue",
        qualifier: "within two months",
      },
      {
        value: "5K",
        label: "community members",
        detail: "3K Facebook + 2K Discord",
      },
    ],
    artifact: {
      kind: "attract",
      interaction: "attract-nearest",
    },
  },
  {
    index: "03",
    slug: "ai-hay",
    name: "AI Hay",
    url: "https://ai-hay.vn/",
    role: "AI Product Owner",
    descriptor: "Series A AI product domain",
    summary:
      "Led a 300K MAU AI product domain at 21 and scaled its user base by 200%.",
    proofs: [
      { value: "300K", label: "monthly active users" },
      { value: "+200%", label: "user growth" },
    ],
    artifact: {
      kind: "unfold",
      interaction: "spread-nearest",
    },
  },
  {
    index: "04",
    slug: "vnggames-cs",
    name: "VNGGames CS",
    url: "https://support.vnggames.com/",
    role: "Product Owner",
    descriptor: "AI-assisted support operations",
    summary:
      "Pioneered AI integration for customer support, increasing AI-resolved requests by 154%.",
    proofs: [
      { value: "100K+", label: "requests per month" },
      { value: "+154%", label: "AI-resolved requests" },
    ],
    artifact: {
      kind: "route",
      interaction: "deflect-nearest",
    },
  },
  {
    index: "05",
    slug: "cosmoagents",
    name: "Cosmoagents",
    url: "https://cosmoagents.ai/",
    role: "Solo PM",
    descriptor: "AI lead-nurturing SaaS",
    summary:
      "Built an AI lead-nurturing SaaS from wireframes to revenue and closed five organic B2B deals.",
    proofs: [{ value: "5", label: "organic B2B deals" }],
    artifact: {
      kind: "loop",
      interaction: "tension-nearest",
    },
  },
] as const satisfies readonly ConceptProject[]

export const CONCEPT_FEATURED_ORDER = CONCEPT_FEATURED_PROJECTS.map(
  ({ name }) => name,
)

export const CONCEPT_HERO_PROOFS = [
  { value: "150K", label: "Imely MAU in two months" },
  { value: "$4K", label: "Imely MRR in two months" },
  { value: "≈28M", label: "Dreamify AI tokens consumed" },
  { value: "1,000", label: "Dreamify registered users" },
] as const satisfies readonly ConceptProofMetric[]

export const CONCEPT_STORY_MILESTONES = [
  {
    date: "MAR 2024 — MAR 2025",
    title: "Research → ship → revenue",
    body: "At Cosmoagents I learned the complete loop: find the pain, shape the product, and keep shipping until the work became revenue.",
    signal: "5 organic B2B deals",
  },
  {
    date: "2024 — 2025",
    title: "Ship at real scale",
    body: "At VNG, product decisions reached more than 180K people across AI platforms built for production—not pitch decks.",
    signal: "+200% AI art requests · +154% AI-resolved CS requests",
  },
  {
    date: "OCT 2025 — PRESENT",
    title: "Turn product craft into traction",
    body: "At AI Hay I led a 300K MAU domain. At Imely I led product development and GTM from zero to 150K MAU and $4K MRR within two months.",
    signal: "300K MAU domain → 150K MAU + $4K MRR in two months",
  },
  {
    date: "NOW",
    title: "Build from scratch",
    body: "Dreamify is the current proof: a self-funded AI data analyst grown to 1,000 new registered users, ≈28M AI tokens consumed, and ≈1,000 conversations created.",
    signal: "1,000 users · ≈28M tokens · ≈1,000 conversations",
  },
] as const satisfies readonly ConceptStoryMilestone[]
