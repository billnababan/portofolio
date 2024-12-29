/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        space: ["Space Grotesk", "Montserrat"], // Tambahkan font Space Grotesk
      },
      colors: {
        background: "#FBFBFB",
        hitam: "#22282C",
        kuning: "#F8B21A",
      },
    },
  },
  plugins: [],
};
