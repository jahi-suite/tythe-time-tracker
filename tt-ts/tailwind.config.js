/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false, // preserve existing app styles
  },
  theme: {
    extend: {
      colors: {
        barn: {
          green: '#1e3a2a',
          'green-muted': '#2c5530',
          tan: '#c4a574',
          cream: '#faf8f5',
          charcoal: '#1a1a1a',
          brown: '#8b7355',
          'text-muted': '#6b7c6d',
        },
        lastcall: {
          ink: '#070a10',
          navy: '#111827',
          panel: '#11192b',
          line: '#26314a',
          smoke: '#9aa4ba',
          haze: '#606a82',
          amber: '#f1b15b',
          brass: '#c98a2e',
          cream: '#f5ead7',
          wine: '#2a1320',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
