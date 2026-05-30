/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-gray': {
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#D2D2D7',
          300: '#86868B',
          400: '#1D1D1F',
        },
        'apple-blue': '#0066CC',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
