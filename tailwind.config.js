/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#f4f6f0',
          100: '#e5ead9',
          200: '#ccd6b3',
          300: '#aabb84',
          400: '#8ca05c',
          500: '#6e8440',
          600: '#5a6e31',
          700: '#475728',
          800: '#3a4622',
          900: '#2e371c',
          950: '#181e0d',
        },
        army: {
          bg:     '#080c07',
          surface:'#0d1209',
          card:   '#111808',
          border: '#1e2a1a',
          muted:  '#2e3e28',
          subtle: '#4a5e42',
          text:   '#8aab78',
          bright: '#aacf90',
          white:  '#e0e8d8',
        },
        accent: {
          green:  '#6aaa48',
          gold:   '#c8a030',
          red:    '#c04040',
          blue:   '#4888c8',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'camo-pattern': "repeating-linear-gradient(45deg, rgba(40,60,25,0.08) 0px, rgba(40,60,25,0.08) 2px, transparent 2px, transparent 12px), repeating-linear-gradient(-45deg, rgba(20,35,12,0.06) 0px, rgba(20,35,12,0.06) 2px, transparent 2px, transparent 18px)",
      }
    },
  },
  plugins: [],
}
