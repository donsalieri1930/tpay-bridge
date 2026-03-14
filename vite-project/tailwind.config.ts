import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './darowizna/index.html', './success/index.html', './error/index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ember: {
          50: '#fff6f3',
          100: '#ffe7df',
          200: '#ffc9ba',
          300: '#ffa18a',
          400: '#f57153',
          500: '#e24d2f',
          600: '#c62f23',
          700: '#9e241e',
          800: '#7f201d',
          900: '#681f1d',
        },
        ink: '#201515',
        sand: '#f7f0e8',
      },
      boxShadow: {
        float: '0 24px 64px rgba(73, 30, 22, 0.18)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      backgroundImage: {
        paper:
          'radial-gradient(circle at top left, rgba(198, 47, 35, 0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(226, 77, 47, 0.14), transparent 28%)',
      },
    },
  },
  plugins: [],
} satisfies Config
