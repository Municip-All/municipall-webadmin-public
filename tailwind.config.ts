import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        municipall: {
          blue: "#0B0080",
          indigo: "#4F46E5",
          light: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 30px -5px rgba(11, 0, 128, 0.05), 0 4px 15px -5px rgba(11, 0, 128, 0.03)",
        glass: "0 8px 32px 0 rgba(11, 0, 128, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
