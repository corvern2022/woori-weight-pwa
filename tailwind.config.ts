import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        jua: ["var(--font-jua)", "sans-serif"],
        gaegu: ["var(--font-gaegu)", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        "card-alt": "var(--card-alt)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-mute": "var(--ink-mute)",
        accent: "var(--accent)",
        "accent-deep": "var(--accent-deep)",
        "accent-soft": "var(--accent-soft)",
        mint: "var(--mint)",
        "mint-deep": "var(--mint-deep)",
        peach: "var(--peach)",
        "peach-deep": "var(--peach-deep)",
        duck: "var(--duck)",
        "duck-deep": "var(--duck-deep)",
        "duck-soft": "var(--duck-soft)",
        dolphin: "var(--dolphin)",
        "dolphin-soft": "var(--dolphin-soft)",
        pink: "var(--pink)",
      },
      boxShadow: {
        card: "var(--shadow)",
        soft: "var(--shadow-soft)",
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "24px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
