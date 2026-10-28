/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f13",
        foreground: "#f5f5f7",
        card: "#1a1a23",
        primary: "#a78bfa",
        accent: "#fbbf24",
      },
    },
  },
  plugins: [],
};
