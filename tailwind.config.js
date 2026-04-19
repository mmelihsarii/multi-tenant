/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 60/30/10 Renk Sistemi
        'primary-bg': '#FAFAFA',
        'primary-card': '#18181B',
        'primary-accent': '#F43F5E',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
}
