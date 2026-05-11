/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D9488',
        secondary: '#021214',
        accent: '#EAB308',
        'brand-yellow': '#FFB300',
        'text-main': '#132729',
        'text-muted': '#4B5563',
        'text-contrast': '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui'],
        serif: ['var(--font-montserrat)', 'ui-serif', 'Georgia', 'serif'],
      },
      animation: {
        reveal: 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeIn: 'fadeIn 0.8s ease-out forwards',
        slowZoom: 'slowZoom 20s ease-out forwards',
        float: 'float 10s ease-in-out infinite',
        slideUp: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        reveal: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slowZoom: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
