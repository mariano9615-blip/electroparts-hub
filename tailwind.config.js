/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ep: {
          green: {
            DEFAULT: '#16a34a',
            light: '#dcfce7',
            dark: '#14532d',
          },
          blue: {
            DEFAULT: '#2563eb',
            light: '#dbeafe',
            dark: '#1e3a8a',
          },
          amber: {
            DEFAULT: '#d97706',
            light: '#fef3c7',
          },
          red: {
            DEFAULT: '#dc2626',
            light: '#fee2e2',
          },
          bg: '#f9fafb',
          surface: '#ffffff',
          border: '#e5e7eb',
          'text-primary': '#111827',
          'text-secondary': '#6b7280',
          'text-muted': '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
