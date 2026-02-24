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
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
