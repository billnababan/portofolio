/** @type {import('tailwindcss').Config} */

// Same tokens as the portfolio (../tailwind.config.js): black and white, hierarchy by
// contrast and size, inversion on interaction. `bad` is the one colour, for errors only.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        raised: "rgb(var(--raised) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        mute: "rgb(var(--mute) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        line: "rgb(255 255 255 / 0.12)",
        "line-strong": "rgb(255 255 255 / 0.22)",
        bad: "rgb(var(--bad) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"Archivo Variable"', "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.8, 0.15, 1)",
      },
    },
  },
  plugins: [],
};
