/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
        },
        ivory: 'rgb(var(--color-ivory) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        semantic: {
          success: {
            DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
            bg: 'rgb(var(--color-success-bg) / <alpha-value>)',
          },
          warning: {
            DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
            bg: 'rgb(var(--color-warning-bg) / <alpha-value>)',
          },
          error: {
            DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
            bg: 'rgb(var(--color-error-bg) / <alpha-value>)',
          },
          info: {
            DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
            bg: 'rgb(var(--color-info-bg) / <alpha-value>)',
          }
        }
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }], // 36px
        'page-title': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 30px
        'section-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px
        'card-title': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }], // 16px
        'body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
        'body-strong': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14px
        'small': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }], // 12px
        'caption': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }], // 11px
      },
      spacing: {
        '4': '0.25rem',
        '8': '0.5rem',
        '12': '0.75rem',
        '16': '1rem',
        '20': '1.25rem',
        '24': '1.5rem',
        '32': '2rem',
        '40': '2.5rem',
        '48': '3rem',
        '64': '4rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'pill': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}
