/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-dark': '#4338CA',
        secondary: '#10B981',
        'secondary-dark': '#059669'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 