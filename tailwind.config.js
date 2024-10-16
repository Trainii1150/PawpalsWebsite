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
      red: {
        100: '#F95454'
      },
      blue: {
        100: '#ebf8ff',  // สีฟ้าอ่อนมาก
        200: '#bee3f8',  // สีฟ้าอ่อน
        300: '#90cdf4',  // สีฟ้าปานกลาง
        400: '#63b3ed',  // สีฟ้าเข้ม
        500: '#4299e1',  // สีฟ้าปกติ
        600: '#3182ce',  // สีฟ้าเข้มขึ้น
        700: '#2b6cb0',  // สีฟ้าเข้มมาก
        800: '#2c5282',  // สีฟ้าเข้มสุด
        900: '#2a4365',  // สีฟ้าเข้มลึกสุด
      },
    },
    extend: {},
  },
  darkMode: false, // ปิดโหมด dark mode
  plugins: [require('daisyui')],
};
