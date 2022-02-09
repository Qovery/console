// tailwind-workspace-preset.js

module.exports = {
  // we also enable !important, because we often need to override materials base css, and without it, we will have to add ! to every statement anyways
  important: true,
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SanFrancisco"', 'Helvetica', 'sans-serif'],
        display: ['HKGrotesk', 'Moderat', 'Apercu', 'Helvetica', 'serif'],
        code: ['Hack'],
      },
      borderRadius: {
        none: '0',
        sm: '.25rem',
        DEFAULT: '.375rem',
        lg: '.5rem',
        full: '9999px',
      },
      colors: {
        violet: {
          50: '#f2f3fe',
          100: '#e0ddfc',
          200: '#c2bcfa',
          300: '#a097f2',
          400: '#847ae6',
          500: '#5b50d6',
          600: '#433ab8',
          700: '#2f289a',
          800: '#1f197c',
          900: '#130f66',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  safelist: [
    {
      pattern: /(bg|border|text|fill)-(violet|red)(-\w+\d+)*/,
      variants: ['focus', 'hover'],
    },
    {
      pattern: /(w|h)-(\w+\d+)*/,
    },
  ],
  plugins: [],
}
