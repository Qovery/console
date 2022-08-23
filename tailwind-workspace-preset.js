// tailwind-workspace-preset.js

module.exports = {
  theme: {
    extend: {
      spacing: {
        'right-help-sidebar': '22.5rem',
        'navbar-height': '4rem',
        'page-container': 'calc(100vh - theme(spacing.navbar-height))',
      },
      maxWidth: {
        'content-with-navigation-left': '42.5rem',
      },
      minHeight: {
        'height-with-navigation-left': 'min-h-[calc(100vh-270px)]',
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'sans-serif'],
        code: ['Hack', 'sans-serif'],
        icons: ['FontAwesome'],
      },
      fontSize: {
        xxs: [
          '0.625rem',
          {
            lineHeight: '1rem',
          },
        ],
        xs: [
          '0.75rem',
          {
            lineHeight: '1rem',
            letterSpacing: '0.002em',
          },
        ],
        ssm: [
          '0.8125rem',
          {
            lineHeight: '1.25rem',
            letterSpacing: '0.0025em',
          },
        ],
        sm: [
          '0.875rem',
          {
            lineHeight: '1.25rem',
            letterSpacing: '0.0025em',
          },
        ],
        base: [
          '1rem',
          {
            lineHeight: '1.5rem',
            letterSpacing: '0.005em',
          },
        ],
      },
      colors: {
        brand: {
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
        accent1: {
          50: '#FCF4FF',
          100: '#F7DFFE',
          200: '#EDC0FD',
          300: '#DDA0FA',
          400: '#CB87F6',
          500: '#B160F0',
          600: '#8B46CE',
          700: '#6830AC',
          800: '#491E8B',
          900: '#331273',
        },
        accent2: {
          50: '#ECFBFE',
          100: '#CAF5FD',
          200: '#96E6FB',
          300: '#61CDF4',
          400: '#3AB0E9',
          500: '#009EDD',
          600: '#0068BC',
          700: '#004E9D',
          800: '#00377F',
          900: '#002769',
        },
        accent3: {
          50: '#F2FEFB',
          100: '#DAFCF4',
          200: '#B6FAEF',
          300: '#8EF2EA',
          400: '#6FE5E5',
          500: '#43C9D5',
          600: '#30A1B7',
          700: '#217B99',
          800: '#155A7B',
          900: '#0C4166',
        },
        success: {
          50: '#F2FEF2',
          100: '#DAFCDA',
          200: '#B7F9BE',
          300: '#8FEEA2',
          400: '#70DE91',
          500: '#44C979',
          600: '#31AC6F',
          700: '#229064',
          800: '#157457',
          900: '#0D604F',
        },
        progressing: {
          50: '#FFF9ED',
          100: '#FFEFCC',
          200: '#FFDA99',
          300: '#FFC066',
          400: '#FFA63F',
          500: '#FF7C00',
          600: '#DB5F00',
          700: '#B74600',
          800: '#933100',
          900: '#7A2200',
        },
        warning: {
          50: '#FFFDED',
          100: '#FEF8CC',
          200: '#FDEE9A',
          300: '#FBE267',
          400: '#F8D441',
          500: '#F4C004',
          600: '#D1A002',
          700: '#AF8202',
          800: '#8D6501',
          900: '#755100',
        },
        error: {
          50: '#FFF8F1',
          100: '#FFEBD8',
          200: '#FFD1B2',
          300: '#FFB28C',
          400: '#FF946F',
          500: '#FF6240',
          600: '#DB402E',
          700: '#B72420',
          800: '#93141A',
          900: '#7A0C1A',
        },
        text: {
          100: '#FFFFFF',
          200: '#E4E6F1',
          300: '#C2C7E0',
          400: '#A1A8CF',
          500: '#6872A6',
          600: '#4C528B',
          700: '#363963',
          800: '#232343',
        },
        element: {
          light: {
            darker: {
              100: '#383E50',
              200: '#2A3041',
              300: '#212738',
              400: '#1A2031',
              500: '#151B2B',
              600: '#101420',
              700: '#0B0E16',
            },
            lighter: {
              100: '#FFFFFF',
              200: '#FBFCFD',
              300: '#F8F9FC',
              400: '#EDF1F7',
              500: '#E2E9F3',
              600: '#C6D3E7',
              700: '#A0AFC5',
              800: '#67778E',
            },
          },
          dark: {
            400: '#23243C',
            500: '#292B46',
            600: '#1D1D31',
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  safelist: [
    {
      pattern: /(bg|border|text|fill)-(violet|red|brand|error|success|bg-element-light-lighter|accent)(-\w+\d+)*/,
      variants: ['focus', 'hover'],
    },
    {
      pattern: /(w|h)-(\w+\d+)*/,
    },
  ],
  plugins: [],
}
