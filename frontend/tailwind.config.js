/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgMain: "#F8FAFC",
        bgSoft: "#D9EAFD",
        borderSoft: "#BCCCDC",
        primaryText: "#9AA6B2",
        darkText: "#334155",
      },
    },
  },
  plugins: [],
};
