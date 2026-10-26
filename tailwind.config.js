/** @type {import('tailwindcss').Config} */

// Black and white only. Hierarchy comes from contrast, size and weight, and
// from inversion (white fill) on interaction — there is no accent colour.
// Contrast on black: fg 18.6:1, mute 6.4:1. `faint` is decorative only
// (struck-through words, separators), never for text that must be read.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        mute: "rgb(var(--mute) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        line: "rgb(255 255 255 / 0.12)",
      },
      fontFamily: {
        sans: ['"Archivo Variable"', "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        name: ["clamp(3.5rem, 15.4vw, 14.75rem)", { lineHeight: "0.86", letterSpacing: "-0.035em" }],
        mega: ["clamp(4rem, 9.6vw, 9.375rem)", { lineHeight: "0.84", letterSpacing: "-0.035em" }],
        display: ["clamp(3.5rem, 9vw, 8.75rem)", { lineHeight: "0.85", letterSpacing: "-0.035em" }],
        case: ["clamp(3rem, 5.6vw, 5.5rem)", { lineHeight: "0.88", letterSpacing: "-0.03em" }],
        statement: ["clamp(2.125rem, 4.9vw, 4.625rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        say: ["clamp(1.25rem, 1.8vw, 1.625rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        lead: ["clamp(1.375rem, 2.1vw, 1.875rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        page: "85rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.8, 0.15, 1)",
      },
    },
  },
  plugins: [],
};
