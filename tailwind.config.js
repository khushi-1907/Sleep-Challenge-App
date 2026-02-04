/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#39a3ef",
        accent: "#2563eb",
        "background-light": "#f6f7f8",
        "background-dark": "#101a22",
        "card-light": "#ffffff",
        "card-dark": "#1a1a1a",
      },
      fontFamily: {
        manrope: ["Manrope_400Regular", "Manrope_500Medium", "Manrope_600SemiBold", "Manrope_700Bold", "Manrope_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
