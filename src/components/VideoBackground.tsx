export function VideoBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-screen h-screen">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/hero/landscape-bg.jpg"
        className="w-full h-full object-cover"
      >
        <source src="/assets/hero/landscape-bg.mp4" type="video/mp4" />
      </video>
      {/* Thin white wash — lifts video brightness so dark glass text is legible */}
      <div className="absolute inset-0 bg-white/10" />
    </div>
  )
}
