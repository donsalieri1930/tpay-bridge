import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ember: {
          50: '#edf4f8',
          100: '#d8e8f0',
          200: '#b6d2e1',
          300: '#86b4cb',
          400: '#4f8eaf',
          500: '#2d6e8f',
          600: '#1c5877',
          700: '#174860',
          800: '#163d50',
          900: '#173446',
        },
        ink: '#0e212d',
        sand: '#eef3f5',
      },
      boxShadow: {
        float: '0 24px 64px rgba(14, 33, 45, 0.16)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      backgroundImage: {
        paper:
          'radial-gradient(circle at top left, rgba(28, 88, 119, 0.14), transparent 32%), radial-gradient(circle at bottom right, rgba(79, 142, 175, 0.12), transparent 28%)',
      },
    },
  },
  plugins: [],
} satisfies Config
