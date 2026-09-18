import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ivory: {
          DEFAULT: '#F7F6F0',
          50: '#FDFAF4',
          100: '#FAF8F2',
          200: '#F7F6F0',
          300: '#EFECE2',
          400: '#E4E0D1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#FCFCFA',
          muted: '#F4F3ED',
          border: '#E3E4DD',
        },
        forest: {
          DEFAULT: '#173F35',
          50: '#F0F5F3',
          100: '#E1ECE7',
          200: '#C2D9CF',
          300: '#94BEB0',
          400: '#5E9B89',
          500: '#387B69',
          600: '#286253',
          700: '#1F4F43',
          800: '#173F35',
          900: '#112F28',
          950: '#091C18',
        },
        sage: {
          DEFAULT: '#7DAF8A',
          50: '#F5F9F6',
          100: '#E8F2EB',
          200: '#D2E6D7',
          300: '#B2D4BC',
          400: '#94C1A0',
          500: '#7DAF8A',
          600: '#60946E',
          700: '#4B7557',
          800: '#3D5E46',
          900: '#334D3A',
        },
        solar: {
          DEFAULT: '#E8A93A',
          50: '#FEFBF5',
          100: '#FDF6E8',
          200: '#FBEDCC',
          300: '#F7DEA5',
          400: '#F1CB74',
          500: '#E8A93A',
          600: '#D28F22',
          700: '#A96E1A',
          800: '#87561B',
          900: '#70481A',
        },
        editorial: {
          text: '#1F2925',
          muted: '#68716B',
          subtle: '#8C958F',
          border: '#E3E4DD',
          divider: '#ECEEE8',
          bg: '#F7F6F0',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'editorial-sm': '0 1px 2px 0 rgba(23, 63, 53, 0.04)',
        'editorial': '0 4px 14px -2px rgba(23, 63, 53, 0.05), 0 1px 3px 0 rgba(23, 63, 53, 0.03)',
        'editorial-md': '0 8px 24px -4px rgba(23, 63, 53, 0.07), 0 2px 6px -2px rgba(23, 63, 53, 0.03)',
        'editorial-lg': '0 16px 36px -6px rgba(23, 63, 53, 0.09), 0 4px 12px -2px rgba(23, 63, 53, 0.04)',
        'solar-glow': '0 0 0 3px rgba(232, 169, 58, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'subtle-pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
