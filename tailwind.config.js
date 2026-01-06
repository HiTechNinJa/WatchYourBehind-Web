/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"HarmonyOS Sans"', '"HarmonyOS Sans SC"', '"Inter"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
