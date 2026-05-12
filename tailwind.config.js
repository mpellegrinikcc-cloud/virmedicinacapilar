/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        gold: '#D4AF37',
        accent: '#D4AF37',
        surface: '#111111',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 28px 80px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: []
};
