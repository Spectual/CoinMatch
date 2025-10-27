import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#f6f1e5',
        gold: {
          300: '#d4b36c',
          400: '#c99a3b',
          500: '#b8860b'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Source Sans Pro"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 15, 15, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
