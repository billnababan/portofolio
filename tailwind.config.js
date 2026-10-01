/** @type {import('tailwindcss').Config} */

// Brand values (owner-defined): hitam #22282C, kuning #F8B21A, background #FBFBFB.
// They are exposed as CSS variables in src/index.css so light and dark mode
// share the same token names; see the contrast notes there.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', '"Space Grotesk Fallback"', "Arial", "sans-serif"],
      },
      colors: {
        paper: token("paper"),
        surface: token("surface"),
        sunken: token("sunken"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        "line-strong": token("line-strong"),
        accent: token("accent"),
        "accent-hover": token("accent-hover"),
        "on-accent": token("on-accent"),
      },
      fontSize: {
        display: ["clamp(2.5rem, 1.75rem + 3.6vw, 4.25rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        title: ["clamp(1.875rem, 1.5rem + 1.6vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        lead: ["clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)", { lineHeight: "1.55" }],
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
};
