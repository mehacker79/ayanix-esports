/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#0b0f19",
          panel: "#131a26",
          border: "#1f293d",
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 24px rgba(34, 211, 238, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
