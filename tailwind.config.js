/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "mc-navy": "#1C2B3A",
        "mc-slate": "#2D4156",
        "mc-brass": "#B8924A",
        "mc-amber": "#D4A96A",
        "mc-stone": "#E8E3D8",
        "mc-cream": "#FDFAF5",
        "mc-text": "#3A3A3A",
        "mc-muted": "#7A7A72",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
