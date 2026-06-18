/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white: 'var(--color-white)',
        gray: {
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
        },
        'deep-black': 'var(--color-deep-black)',
        'midnight': 'var(--color-midnight)',
        'card-bg': 'var(--color-card-bg)',
        'electric-blue': 'var(--color-electric-blue)',
        'neon-blue': 'var(--color-neon-blue)',
        'neon-purple': 'var(--color-neon-purple)',
        'neon-cyan': 'var(--color-neon-cyan)',
        'neon-pink': 'var(--color-neon-pink)',
        'glass': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #050505 0%, #0a0a2e 50%, #050505 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        'neon-gradient': 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #06b6d4)',
        'gold-gradient': 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.2)',
        'neon-purple': '0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.2)',
        'neon-cyan': '0 0 20px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59,130,246,0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59,130,246,0.8), 0 0 40px rgba(59,130,246,0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      screens: {
        'xs': '375px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
