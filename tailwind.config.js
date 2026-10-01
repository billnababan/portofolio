/** @type {import('tailwindcss').Config} */

// Owner brand values: hitam #22282C, kuning #F8B21A, background #FBFBFB.
// The site is dark-first. One light section (skills) uses cream + ink.
// Contrast on coal: text 15.4:1, muted 6.6:1, accent 9.8:1. On cream: ink 12.6:1, ink-muted 5.5:1.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        coal: "#141719",
        raised: { DEFAULT: "#1C2023", 2: "#23282C" },
        line: "#2C3236",
        text: "#EDEDEA",
        muted: "#969EA3",
        accent: { DEFAULT: "#F8B21A", hover: "#FAC44D" },
        cream: "#EFEBE3",
        ink: { DEFAULT: "#22282C", muted: "#5A5F5E" },
        paper: "#FBFBFB",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Space Grotesk Fallback"', "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        mega: ["clamp(3rem, 1.2rem + 8.2vw, 9.5rem)", { lineHeight: "0.88", letterSpacing: "-0.04em" }],
        display: ["clamp(2.5rem, 1.5rem + 4.6vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        title: ["clamp(2rem, 1.4rem + 2.6vw, 3.75rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        statement: ["clamp(1.5rem, 1.1rem + 1.8vw, 2.75rem)", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        lead: ["clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", { lineHeight: "1.6" }],
      },
      maxWidth: {
        prose: "62ch",
      },
    },
  },
  plugins: [],
};
