/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        'cta': '#FAFF10',
        'cta-text': '#0F172A',
        'accent-gold': '#FFC966',
        'bg-main': '#FFFFFF',
        'bg-alt': '#F0F4FA',
        'text-primary': '#0F172A',
        'text-secondary': '#374151',
        'header-dark': '#222222',
        'input-bg': '#F9FAFB',
        'input-border': '#D1D5DB',
        'card-border': '#E5E7EB',
      },
      fontFamily: {
        'heading': ['Figtree', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'btn': '10px',
        'pill': '50px',
        'card': '16px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'cta-hover': '0 4px 20px rgba(250,255,16,0.4)',
        'elevated': '0 2px 12px rgba(0,0,0,0.06)',
        'floating': '0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
