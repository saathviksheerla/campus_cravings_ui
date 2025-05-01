/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B3A1D',      // Dark olive green/brown
        secondary: '#F2E9C9',    // Light cream
        accent: '#FFD700',       // Gold
        'primary-light': '#4E4D2A',
        'primary-dark': '#2A2912',
        'secondary-light': '#FFF8E6',
        'secondary-dark': '#E5D9B6',
        'accent-light': '#FFE033',
        'accent-dark': '#CCAC00',
        'food-card': {
          'red': '#A73121',      // Dark red for food cards
          'orange': '#C3762A',   // Orange for food cards
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        'display-base': ['3rem', { lineHeight: '3.5rem' }],    // 48px
        'display-lg': ['3.75rem', { lineHeight: '4rem' }],     // 60px
        'display-xl': ['4.5rem', { lineHeight: '5rem' }],      // 72px
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'elegant': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'luxury': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}