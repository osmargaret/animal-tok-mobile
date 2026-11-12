/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0d1117",
        surface: "#161b22",
        card: "#1e293b",
        primary: {
          DEFAULT: "#06b6d4", // Vibrant cyan/teal for AnimalTok
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#8b5cf6",
          foreground: "#ffffff",
        },
        like: "#ef4444",
        muted: {
          DEFAULT: "#334155",
          foreground: "#94a3b8",
        },
        accent: "#f59e0b",
      },
    },
  },
  plugins: [],
};
