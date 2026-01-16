/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kadilac: {
          100: '#c46266',
          200: '#a6494e',
          300: '#883136',
          400: '#6b181e',
          500: '#4d0006',
        }
      }
    },
  },
  plugins: [],
}