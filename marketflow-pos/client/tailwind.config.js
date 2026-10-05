/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        ink: "#18231e",
        muted: "#77827d",
        canvas: "#f5f7f4",
        forest: "#176b4a",
        mint: "#eaf5ee",
        line: "#e9ede9",
      },
      boxShadow: {
        card: "0 3px 18px rgba(24, 35, 30, 0.045)",
        pop: "0 18px 55px rgba(24, 35, 30, 0.16)",
      },
    },
  },
  plugins: [],
};
