import { VideoBackground } from "@/components/VideoBackground"
import { Hero } from "@/components/Hero"
import { StickyStack } from "@/components/StickyStack"
import { HorizontalTimeline } from "@/components/HorizontalTimeline"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <>
      <VideoBackground />
      <main>
        <Hero />
        <StickyStack />
        <HorizontalTimeline />
        <Footer />
      </main>
    </>
  )
}
