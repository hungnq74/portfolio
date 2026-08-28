import type { Metadata } from "next"
import { Bricolage_Grotesque, Inter } from "next/font/google"
import { LenisProvider } from "@/components/LenisProvider"
import "./globals.css"

// Bricolage carries display, Inter carries running text — the same split the
// /concept direction settled on, now shared by every page.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "hungnq",
  description: "Hung Nguyen — Founder · Product Builder · AI Native. Based in HCMC, Vietnam.",
  icons: {
    icon: "/icon-v2.webp",
  },
  openGraph: {
    title: "hungnq",
    description: "Founder · Product Builder · AI Native · HCMC, Vietnam.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-slate-900 antialiased overflow-x-clip">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
