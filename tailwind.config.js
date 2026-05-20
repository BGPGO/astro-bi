/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        bg: {
          DEFAULT: "#0a0c10",
          elev: "#11141a",
          card: "#161a22",
        },
        ink: {
          DEFAULT: "#222732",
          subtle: "#1a1f29",
        },
        accent: {
          DEFAULT: "#4fc3f7",
          green: "#5dd99f",
          purple: "#a78bfa",
          orange: "#ffb86b",
          rose: "#ff7a90",
        },
        muted: "#7a8597",
      },
    },
  },
  plugins: [],
};
