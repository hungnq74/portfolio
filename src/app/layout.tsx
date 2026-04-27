import type { Metadata } from "next"
import { Instrument_Serif } from "next/font/google"
import localFont from "next/font/local"
import { LenisProvider } from "@/components/LenisProvider"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
})

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
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
    <html lang="en" className={`${instrumentSerif.variable} ${geist.variable}`}>
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
