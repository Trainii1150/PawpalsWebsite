/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: ["./src/**/*.{html,js}"],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      purple: '#3f3cbb',
      midnight: '#121063',
      metal: '#565584',
      tahiti: '#3ab7bf',
      silver: '#ecebff',
      'bubble-gum': '#ff77e9',
      bermuda: '#78dcca',
      yellow: {
        100: '#ffb800',
        200: '#ffd464',
        300: '#ffd264'
      },
      green: {
        100: '#14B8A6'
      },
    },
    extend: {},
  },
  darkMode: false, // ตรวจสอบให้แน่ใจว่า dark mode ถูกปิดอยู่
  plugins: [],
};
