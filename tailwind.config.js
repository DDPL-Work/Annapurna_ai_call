/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        paper: "#F7F5F0",
        surface: "#FFFFFF",
        ink: "#1C1B18",
        muted: "#726C63",
        line: "#E4DFD5",
        brand: {
          50: "#EEF3F0",
          100: "#D7E4DC",
          300: "#7FA894",
          500: "#1B4B43",
          600: "#153A34",
          700: "#0F2B26",
        },
        brass: {
          100: "#F3E6C9",
          300: "#D9B872",
          500: "#B8863B",
          600: "#93692B",
        },
        brick: {
          100: "#F3E0D8",
          500: "#A8452F",
          600: "#873424",
        },
        moss: {
          100: "#E3ECE1",
          500: "#3F7856",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,27,24,0.06)",
      },
    },
  },
  plugins: [],
};
