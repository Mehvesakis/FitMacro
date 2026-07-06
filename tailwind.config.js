/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F9F7F2',
        mint: {
          50: '#F0FAF4',
          100: '#D8F3E2',
          200: '#B5E6C8',
          500: '#3CB371',
          600: '#2D9F5A',
          700: '#248A4D',
        },
        kalori: {
          green: '#2D9F5A',
          orange: '#F97316',
        },
        macro: {
          protein: '#2D9F5A',
          carb: '#3B82F6',
          fat: '#F97316',
          fiber: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.06)',
        nav: '0 1px 6px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
