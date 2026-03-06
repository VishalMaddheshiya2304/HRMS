/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        sidebar: "#0D1B2A",
        "sidebar-hover": "#1A2E42",
        "sidebar-active": "#1E3A52",
        accent: "#3B7DD8",
        "accent-hover": "#2F6DC0",
        surface: "#F5F7FA",
        card: "#FFFFFF",
        border: "#E4E8EF",
        muted: "#8A97A8",
        present: "#16A34A",
        absent: "#DC2626",
      },
    },
  },
  plugins: [],
};
