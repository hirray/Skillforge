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
          DEFAULT: '#b29af5',
          fg: '#0b0b0e',
        },
        'primary-fg': '#0b0b0e',
        accent: {
          DEFAULT: '#8861dc',
          fg: '#f0edf5',
        },
        'accent-fg': '#f0edf5',
        highlight: '#6ad4bb',
        yellow: '#d9b774',
        warning: '#d9b774',
        bg: '#0b0b0e',
        surface: '#111114',
        raised: '#19191e',
        mainText: '#f0edf5',
        muted: '#96939f',
        uiBorder: '#26262e',

        status: {
          draft: { bg: '#19191e', text: '#96939f' },
          recruiting: { bg: '#2a2215', text: '#d9b774' },
          active: { bg: '#221a36', text: '#b29af5' },
          paused: { bg: '#2a2215', text: '#d9b774' },
          completed: { bg: '#132822', text: '#6ad4bb' },
          verified: { bg: '#221a36', text: '#b29af5' },
          archived: { bg: '#19191e', text: '#96939f' },
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
