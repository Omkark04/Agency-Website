module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#015bad',  // Primary Blue — Navbar, Footer, main CTAs
          dark:      '#0A1F44',  // Dark Blue — deep backgrounds, gradient ends
          gold:      '#F5B041',  // Golden Yellow — accents, highlights, icons
          surface:   '#1F2933',  // Dark Surface — dark mode backgrounds
          white:     '#FFFFFF',  // Pure White — text on dark backgrounds
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}