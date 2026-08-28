import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-bricolage)", "Helvetica Neue", "system-ui", "sans-serif"],
        sans:  ["var(--font-inter)", "Helvetica Neue", "system-ui", "sans-serif"],
        mono:  ["var(--font-inter)", "Helvetica Neue", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
