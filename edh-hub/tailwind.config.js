/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07070e",
        foreground: "#f5f5f7",
        card: "#12121c",
        primary: "#8b5cf6",
        accent: "#eab308",
        casual: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 18px 40px -28px rgba(0, 0, 0, 0.75)",
        "card-hover": "0 16px 36px -24px rgba(139, 92, 246, 0.45)",
      },
      keyframes: {
        "fade-rise": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "mark-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 0 rgba(234, 179, 8, 0))" },
          "50%": { filter: "drop-shadow(0 0 10px rgba(234, 179, 8, 0.35))" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 220ms ease-out both",
        "soft-pulse": "soft-pulse 2.8s ease-in-out infinite",
        "mark-glow": "mark-glow 3.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
