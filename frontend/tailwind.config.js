/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Quest: ["Questrial", "sans-serif"],
      },
      fontSize: {
        h1: "7rem", // Custom size for h1
        h2: "3.5rem", // Custom size for h2
      },
      fontWeight: {
        h1: "700", // Custom font weight for h1
        h2: "600", // Custom font weight for h2
      },
      visibility: ["group-hover"],
    },
  },
  plugins: [],
};
