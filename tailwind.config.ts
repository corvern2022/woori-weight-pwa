import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f8fb",
        card: "#ffffff",
        accent: "#1677ff",
        ink: "#10243e",
      },
      boxShadow: {
        card: "0 10px 25px rgba(16, 36, 62, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
