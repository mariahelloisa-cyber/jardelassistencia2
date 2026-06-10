/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jadel-black': '#050505',
        'jadel-dark': '#0d0d0d',
        'jadel-gold': '#D4AF37', 
        'jadel-yellow': '#fbbf24', 
      }
    },
  },
  plugins: [],
}