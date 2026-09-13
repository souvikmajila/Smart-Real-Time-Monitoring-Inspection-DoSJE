/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dosje: {
          navy: '#0b1f3a',
          blue: '#12406b',
          accent: '#f5a623',
          green: '#1f9d55',
          red: '#d64545'
        }
      }
    }
  },
  plugins: []
};
