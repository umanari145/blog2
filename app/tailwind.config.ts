import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#faf9f7",
          100: "#f0eeea",
          200: "#ddd9d2",
          300: "#c4bfb5",
          400: "#9c9588",
          500: "#7a7265",
          600: "#5c564c",
          700: "#3d3a34",
          800: "#2a2824",
          900: "#1a1916",
        },
        accent: {
          DEFAULT: "#4f6f52",
          light: "#6b8f6e",
          dark: "#3d523f",
          muted: "#e8f0e9",
        },
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(at 40% 20%, rgb(232 240 233 / 0.9) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(240 238 232 / 0.8) 0px, transparent 45%), radial-gradient(at 0% 50%, rgb(232 236 240 / 0.6) 0px, transparent 40%)",
        "mesh-dark":
          "radial-gradient(at 40% 20%, rgb(45 82 63 / 0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(30 40 45 / 0.5) 0px, transparent 45%), radial-gradient(at 0% 50%, rgb(40 50 60 / 0.3) 0px, transparent 40%)",
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06)",
        "card-hover":
          "0 4px 12px rgb(79 111 82 / 0.12), 0 16px 40px rgb(0 0 0 / 0.08)",
        "card-dark":
          "0 1px 2px rgb(0 0 0 / 0.2), 0 8px 24px rgb(0 0 0 / 0.35)",
      },
    },
  },
  plugins: [typography],
};

export default config;
