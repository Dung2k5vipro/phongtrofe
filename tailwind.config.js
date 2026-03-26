/** @type {import('tailwindcss').Config} */
const animate = require("tailwindcss-animate")

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [animate],
}