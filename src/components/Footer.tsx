export function Footer() {
  return (
    <footer className="min-h-screen flex items-center justify-center px-6 py-24">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl p-12 text-center shadow-2xl md:p-16"
        style={{
          background: "rgba(255,255,255,0.58)",
          backdropFilter: "saturate(180%) blur(28px)",
          WebkitBackdropFilter: "saturate(180%) blur(28px)",
          border: "1px solid rgba(255,255,255,0.72)",
          boxShadow: "0 25px 50px -12px rgba(15,23,42,0.22)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.24) 48%, rgba(255,255,255,0.12))",
          }}
        />

        <div className="relative z-10">
        <p
          className="font-sans text-slate-800 leading-relaxed mb-8 mx-auto max-w-md"
          style={{ fontSize: "clamp(16px, 1.6vw, 18px)", fontWeight: 400 }}
        >
          Operating at the intersection of product intuition and AI deployment.
        </p>

        <p
          className="font-serif italic text-slate-950 leading-tight mb-12"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Let&apos;s build.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {[
            { label: "Email", href: "mailto:hungng.forwork@gmail.com" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/hwnguyxn/" },
            { label: "GitHub", href: "https://github.com/hungnq74" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="px-5 py-2 rounded-full font-sans text-sm font-medium text-slate-800 hover:text-slate-950 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.45)]"
              style={{
                background: "rgba(255,255,255,0.58)",
                backdropFilter: "saturate(180%) blur(12px)",
                WebkitBackdropFilter: "saturate(180%) blur(12px)",
                border: "1px solid rgba(255,255,255,0.78)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
        </div>
      </div>
    </footer>
  )
}
