/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          950: '#030712',
          900: '#060b17',
          850: '#091024',
          800: '#0e1832',
          750: '#142347',
          700: '#1b2d5a',
          600: '#274284',
          500: '#345db5',
          accent: '#0066FF',
          'accent-hover': '#1a75ff',
          cyan: '#00e5ff',
          purple: '#9d4edd',
          border: 'rgba(56, 189, 248, 0.15)',
          'border-active': 'rgba(0, 102, 255, 0.45)',
          surface: '#0b1329',
          'surface-light': '#101c3d',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 102, 255, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 229, 255, 0.6)' },
        },
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 102, 255, 0.35)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.35)',
        'neon-sm': '0 0 10px rgba(0, 102, 255, 0.25)',
      },
    },
  },
  plugins: [],
}
