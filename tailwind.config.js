/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // 主色调：深紫色
        secondary: '#10B981', // 辅助色：绿色
        dark: {
          100: '#374151',
          200: '#1F2937',
          300: '#111827',
          400: '#030712'
        }
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('preline/plugin'),
  ],
  darkMode: 'class'
}