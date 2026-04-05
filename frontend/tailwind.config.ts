import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1E3A5F", light: "#2A5080", dark: "#142840" },
        secondary: { DEFAULT: "#2D7D46", light: "#3A9958", dark: "#1F5A32" },
        accent: { DEFAULT: "#D4A853", light: "#E0BD75", dark: "#B8903A" },
        background: "#F8F9FA",
        foreground: "#1A1A2E",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Bengali", "sans-serif"],
        bengali: ["Noto Sans Bengali", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
