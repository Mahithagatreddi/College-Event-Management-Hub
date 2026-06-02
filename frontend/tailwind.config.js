/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#080b10',
          card: 'rgba(18, 24, 41, 0.65)',
          cardHover: 'rgba(28, 38, 65, 0.8)',
          space: '#0e1320'
        },
        neon: {
          purple: '#8b5cf6',
          purpleGlow: 'rgba(139, 92, 246, 0.35)',
          cyan: '#06b6d4',
          cyanGlow: 'rgba(6, 182, 212, 0.35)',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b'
        }
      },
      fontFamily: {
        title: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'pulse-glow': 'pulse-glow 2s infinite'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
