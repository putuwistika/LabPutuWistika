/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primaryDark: '#1D1D1F',
        accentBlue: '#0071E3',
        accentBlueHover: '#0077ED',
        softGray: '#F5F5F7',
        mediumGray: '#D2D2D7',
        textPrimary: '#1D1D1F',
        textSecondary: '#6E6E73'
      },
      backgroundImage: {
        'gradient-apple': 'linear-gradient(to bottom right, #D5E8F7, #E8F2FC, #FFFFFF)'
      }
    }
  },
  plugins: []
}
