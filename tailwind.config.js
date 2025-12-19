/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode using a class
  theme: {
    extend: {
      colors: {
        dark: {
          '50': '#E8E8E8',
          '100': '#B0B0B0',
          '200': '#808080',
          '300': '#505050',
          '400': '#333333', // Custom dark color for background
          '500': '#222222',
          '600': '#1A1A1A',
          '700': '#121212', // Slightly lighter dark for components
          '800': '#0A0A0A',
          '900': '#000000',
        },
        primary: '#BB86FC', // Example accent color (purple-ish)
        secondary: '#03DAC6', // Example secondary accent (teal-ish)
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
