/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        paper: "#F5F7F4",
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F0F3F0",
          hover: "#FAFCF9",
        },
        ink: {
          DEFAULT: "#14201B",
          secondary: "#3D4F46",
        },
        muted: "#66756E",
        line: {
          DEFAULT: "#DCE2DD",
          subtle: "#E9EEEA",
        },
        brand: {
          50: "#F0F4F2",
          100: "#D7E4DC",
          200: "#B4CFC1",
          300: "#8BB5A2",
          400: "#4D8E74",
          500: "#12513F",
          600: "#0B3B2E",
          700: "#083126",
          800: "#05221B",
          900: "#02130F",
        },
        gold: {
          100: "#FFF6D6",
          300: "#FFE485",
          400: "#FFD433",
          500: "#FFC300",
          600: "#D9A200",
          700: "#A67B00",
        },
        brass: {
          100: "#F3E6C9",
          200: "#E6D19E",
          300: "#D9B872",
          500: "#B8863B",
          600: "#93692B",
        },
        brick: {
          50: "#FDF4F2",
          100: "#F9E5E1",
          200: "#F2C7BE",
          300: "#E39A8B",
          500: "#A63D2F",
          600: "#873024",
          700: "#69221A",
        },
        moss: {
          50: "#F0F6F2",
          100: "#DCEDE1",
          500: "#2D6A4F",
          600: "#1B4332",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(11, 59, 46, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 4px 12px rgba(11, 59, 46, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
        dropdown: "0 10px 25px -5px rgba(11, 59, 46, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)",
        modal: "0 20px 35px -10px rgba(11, 59, 46, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

