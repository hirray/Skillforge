/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A1680',
          fg: '#FFFFFF',
        },
        'primary-fg': '#FFFFFF',
        accent: {
          DEFAULT: '#93B2F8',
          fg: '#0A1680',
        },
        'accent-fg': '#0A1680',
        highlight: '#FBEDB0',
        yellow: '#FBEDB0',
        warning: '#F1B94C',
        bg: '#FCFDFF',
        surface: '#FFFFFF',
        mainText: '#16213A',
        muted: '#6B7685',
        uiBorder: '#E7EAF3',

        status: {
          draft: { bg: '#E7EAF3', text: '#6B7685' },
          recruiting: { bg: '#F1B94C', text: '#16213A' },
          active: { bg: '#93B2F8', text: '#0A1680' },
          paused: { bg: '#FBEDB0', text: '#16213A' },
          completed: { bg: '#0A1680', text: '#FCFDFF' },
          verified: { bg: '#0A1680', text: '#FCFDFF' },
          archived: { bg: '#E7EAF3', text: '#6B7685' },
        },
      },
      boxShadow: {
        'elevation-1': '0 1px 3px 0 rgba(10, 22, 128, 0.05), 0 1px 2px 0 rgba(10, 22, 128, 0.03)',
        'elevation-2': '0 4px 8px -1px rgba(10, 22, 128, 0.08), 0 2px 4px -2px rgba(10, 22, 128, 0.04)',
        'elevation-3': '0 12px 20px -3px rgba(10, 22, 128, 0.12), 0 4px 6px -4px rgba(10, 22, 128, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
