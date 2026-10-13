/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Core brand: fresh rescue-green + warm harvest amber (trust) + deep basil (ink)
        basil: {
          950: "#0F2318",
          900: "#163A26",
          800: "#1F5236",
          700: "#2A6F49",
          600: "#357F55",
        },
        harvest: {
          50: "#FFF8E8",
          100: "#FCEBBF",
          400: "#E8A93B",
          500: "#D6922A",
          600: "#B87620",
        },
        clay: {
          50: "#FBF7F1",
          100: "#F3EBDD",
        },
        rescue: {
          red: "#C4543A",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(15, 35, 24, 0.04)",
        glow: "0 12px 40px rgba(53, 127, 85, 0.15)",
      },
    },
  },
  plugins: [],
};
