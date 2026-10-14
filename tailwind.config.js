/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fantasy: {
          darkest: '#0c0d14',
          dark: '#141622',
          panel: '#1e2235',
          border: '#333852',
          wood: '#3b2f27',
          woodBorder: '#5c483a',
          gold: '#f59e0b',
          goldBright: '#fbbf24',
          goldLight: '#fef3c7',
          crystal: '#38bdf8',
          crystalGlow: '#0284c7',
          crystalBright: '#7dd3fc',
          hp: '#ef4444',
          hpBg: '#7f1d1d',
          mp: '#3b82f6',
          mpBg: '#1e3a8a',
          sp: '#10b981',
          spBg: '#064e3b',
          exp: '#a855f7',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'sans-serif'],
        ui: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
