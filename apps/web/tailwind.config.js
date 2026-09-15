/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#16151A",
        surface: {
          DEFAULT: "#1D1C22",
          raised: "#232229",
        },
        border: {
          DEFAULT: "rgba(42, 41, 52, 0.6)",
          soft: "rgba(42, 41, 52, 0.5)",
        },
        text: {
          primary: "#EDEAE3",
          secondary: "#8B8894",
          tertiary: "#5C5A66",
        },
        accent: {
          DEFAULT: "#C9A26D",
          soft: "rgba(201, 162, 109, 0.12)",
        },
        status: {
          active: "#7A9B7E",
          attention: "#B0715A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-ui)", "Inter", "system-ui", "sans-serif"],
        ui: ["var(--font-ui)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        button: "6px",
        panel: "10px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};
