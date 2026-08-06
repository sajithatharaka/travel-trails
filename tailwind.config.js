/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "deep-jungle": "oklch(32% 0.08 160)",
        jungle: "oklch(48% 0.10 160)",
        "card-jungle": "oklch(28% 0.06 160)",
        terracotta: "#c9682f",
        "page-bg": "oklch(98% 0.012 90)",
        "section-tint": "oklch(95% 0.02 95)",
        surface: "oklch(99% 0.005 90)",
        ink: "oklch(24% 0.03 155)",
        "ink-soft": "oklch(40% 0.025 155)",
        line: "oklch(90% 0.02 100)",
        "icon-tint": "oklch(93% 0.035 160)",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["'Segoe UI'", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
