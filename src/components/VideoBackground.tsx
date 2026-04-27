export function VideoBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-screen h-screen">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/assets/hero/landscape-bg.mp4" type="video/mp4" />
      </video>
      {/* Removed thin white wash to make everything look more vibrant */}
    </div>
  )
}
