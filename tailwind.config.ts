import type { Config } from "tailwindcss";

// Brand tokens mirror app/editorial.css :root. Available to Tailwind utilities
// for any UI built outside the ported editorial layout.
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        ink: "#0A0A0A",
        "ink-soft": "#6B6B6B",
        soft: "#F2F0EC",
        line: "#E5E2DC",
      },
      fontFamily: {
        display: ["'Bodoni Moda'", "Georgia", "serif"],
        serif: ["'Bembo'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
