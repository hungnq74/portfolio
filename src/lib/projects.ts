export interface Project {
  name: string
  url: string
  role: string
  metric: string
  highlight: string
  colors: string[]
}

export const PROJECTS: Project[] = [
  {
    name: "Dreamify",
    url: "https://app.dreamify.dev/",
    role: "Founder & CEO",
    metric: "AI-native Data Analyst",
    highlight: "Built from 0 to early traction. Redefining how marketers trust and interact with raw data.",
    colors: ["#0284c7", "#fb923c", "#bae6fd"],
  },
  {
    name: "Curate",
    url: "https://curate-me.vercel.app/",
    role: "Solo Builder",
    metric: "Digital Identity",
    highlight: "Architecting personal curation spaces.",
    colors: ["#0f172a", "#94a3b8", "#f8fafc"],
  },
  {
    name: "Al Hay",
    url: "https://ai-hay.vn/",
    role: "AI Product Owner",
    metric: "300K MAU",
    highlight: "Led a Series A AI product domain at 21. Scaled users by 200%.",
    colors: ["#06b6d4", "#3b82f6", "#a5f3fc"],
  },
  {
    name: "Imely",
    url: "https://imely.ai/",
    role: "AI Product Owner",
    metric: "Gen Z Companion",
    highlight: "Deploying AI empathy for Southeast Asia.",
    colors: ["#c084fc", "#db2777", "#f3e8ff"],
  },
  {
    name: "Cosmoagents",
    url: "https://cosmoagents.ai/",
    role: "Solo PM",
    metric: "5 B2B Deals",
    highlight: "Built an AI lead-nurturing SaaS. From wireframes to revenue.",
    colors: ["#1e1b4b", "#4f46e5", "#c7d2fe"],
  },
  {
    name: "VNGGames CS",
    url: "https://support.vnggames.com/",
    role: "Product Owner",
    metric: "100K+ Requests/Mo",
    highlight: "Pioneered AI integration for CS, boosting AI-resolved requests by 154%.",
    colors: ["#ea580c", "#f97316", "#ffedd5"],
  },
  {
    name: "VNGGames Artian",
    url: "https://vng.com.vn/news/technology/vnggames-ket-hop-cong-nghe-va-nghe-thuat-trong-ky-nguyen-ai-4064.html",
    role: "Contributor",
    metric: "AI + Art",
    highlight: "Fusing generative AI with creative production.",
    colors: ["#8b5cf6", "#d946ef", "#fdf4ff"],
  },
  {
    name: "Heritage Wander",
    url: "https://heritage-wander.vercel.app/",
    role: "Solo Builder",
    metric: "Phygital GPS",
    highlight: "Mapping cultural heritage through spatial tech.",
    colors: ["#65a30d", "#d97706", "#fef3c7"],
  },
  {
    name: "WeShare",
    url: "https://weshare.asia",
    role: "Growth",
    metric: "3,000+ Users Acquired",
    highlight: "Driving social-impact technology at scale.",
    colors: ["#10b981", "#34d399", "#d1fae5"],
  },
]
