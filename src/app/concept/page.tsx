import type { Metadata } from "next"
import { ConceptLanding } from "@/components/concept/ConceptLanding"

export const metadata: Metadata = {
  title: "Hung Nguyen — Product operator & AI builder",
  description:
    "An experimental portfolio direction for Hung Nguyen: founder, product operator, and AI-native builder in Ho Chi Minh City.",
}

export default function ConceptPage() {
  return <ConceptLanding />
}
