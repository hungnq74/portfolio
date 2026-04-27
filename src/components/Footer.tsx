export function Footer() {
  return (
    <footer className="min-h-screen flex items-center justify-center px-6 py-24">
      <div
        className="w-full max-w-2xl rounded-3xl p-12 md:p-16 text-center"
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        <p
          className="font-sans font-light text-slate-700 leading-relaxed mb-8"
          style={{ fontSize: "clamp(15px, 1.6vw, 18px)" }}
        >
          Operating at the intersection of product intuition and AI deployment.
        </p>

        <p
          className="font-serif italic text-slate-900 leading-tight mb-12"
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
              className="px-5 py-2 rounded-full font-sans text-sm text-slate-700 hover:text-slate-900 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <p
          className="font-sans uppercase tracking-widest text-slate-400"
          style={{ fontSize: "11px", opacity: 0.5 }}
        >
          HCMC · Vietnam · 2025
        </p>
      </div>
    </footer>
  )
}
