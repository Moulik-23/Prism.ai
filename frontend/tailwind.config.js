/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Prism Spectrum Color Palette - Vibrant & Dynamic
        prism: {
          // Primary spectrum colors (rainbow refracted light)
          violet: '#8B5CF6',
          indigo: '#6366F1',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          teal: '#14B8A6',
          green: '#10B981',
          emerald: '#059669',
          yellow: '#F59E0B',
          orange: '#F97316',
          pink: '#EC4899',
          rose: '#F43F5E',
          // Neutral tones with vibrant accents
          dark: '#0A0A0F',
          darker: '#050508',
          light: '#FAFAFC',
          lighter: '#FFFFFF',
        },
        // Legacy primary mapping (keeping for compatibility)
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      backgroundImage: {
        'prism-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 25%, #3B82F6 50%, #06B6D4 75%, #10B981 100%)',
        'prism-radial': 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2), rgba(59, 130, 246, 0.1))',
        'aurora': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 25%, rgba(59, 130, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 75%, rgba(16, 185, 129, 0.1) 100%)',
        'prism-dark': 'linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'prism-rotate': 'prismRotate 20s linear infinite',
        'prism-glow': 'prismGlow 3s ease-in-out infinite alternate',
        'aurora': 'aurora 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        prismRotate: {
          '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(360deg)' },
        },
        prismGlow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(99, 102, 241, 0.3)',
            filter: 'brightness(1)',
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(99, 102, 241, 0.5)',
            filter: 'brightness(1.2)',
          },
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'prism': '0 10px 40px rgba(139, 92, 246, 0.3), 0 0 20px rgba(99, 102, 241, 0.2)',
        'prism-lg': '0 20px 60px rgba(139, 92, 246, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)',
        'prism-glow': '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(99, 102, 241, 0.4)',
      },
    },
  },
  plugins: [],
}
