/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0b0d",
        panel: "#111318",
        gold: "#c9a55d",
        cream: "#eee5d3",
        imperial: "#7b2028"
      },
      boxShadow: {
        imperial: "0 22px 70px rgba(0,0,0,.35)"
      }
    }
  },
  plugins: []
};

