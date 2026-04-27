import { VideoBackground } from "@/components/VideoBackground"
import { GlassNav } from "@/components/GlassNav"
import { Hero } from "@/components/Hero"
import { StickyStack } from "@/components/StickyStack"
import { HorizontalTimeline } from "@/components/HorizontalTimeline"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <>
      <VideoBackground />
      <GlassNav />
      <main>
        <Hero />
        <StickyStack />
        <HorizontalTimeline />
        <Footer />
      </main>
    </>
  )
}
