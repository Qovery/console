// tailwind-workspace-preset.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        label: 'transform, font-size',
      },
      spacing: {
        'right-help-sidebar': '22.5rem',
        'navbar-height': '4rem',
      },
      maxWidth: {
        'content-with-navigation-left': '46.5rem',
      },
      minHeight: {
        'height-with-navigation-left': 'calc(100vh - 270px)',
        'page-container': 'calc(100vh - theme(spacing.navbar-height))',
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
        lg: [
          '1.25rem',
          {
            lineHeight: '1.75rem',
          },
        ],
      },
      backgroundImage: {
        'scroll-shadow-bottom':
          'linear-gradient(180deg,hsla(0,0%,100%,0) 40%,hsla(0,0%,100%,0)),radial-gradient(farthest-side at 50% 0,rgba(0,0,0,.13),transparent)',
        'scroll-shadow-up':
          'radial-gradient(farthest-side at 50% 0,rgba(0,0,0,.13),transparent),linear-gradient(180deg,hsla(0,0%,100%,0) 40%,hsla(0,0%,100%,0))',
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
          200: '#C2C7E0',
          300: '#A1A8CF',
          400: '#6872A6',
          500: '#4C528B',
          600: '#363963',
          700: '#232343',
          800: '#151529',
        },
        element: {
          light: {
            darker: {
              100: '#2A3041',
              200: '#212738',
              300: '#1A2031',
              400: '#151B2B',
              500: '#101420',
              600: '#0B0E16',
              700: '#000000',
            },
            lighter: {
              100: '#FFFFFF',
              200: '#F8F9FC',
              300: '#EDF1F7',
              400: '#E2E9F3',
              500: '#C6D3E7',
              600: '#A0AFC5',
              700: '#67778E',
              800: '#383E50',
            },
          },
          dark: {
            400: '#23243C',
            500: '#292B46',
            600: '#1D1D31',
          },
        },
      },
      animation: {
        'action-bar-fade-in': '0.35s cubic-bezier(0.21, 1.02, 0.73, 1) 0s 1 normal forwards actionBarFadeIn',
        'action-bar-fade-out': '0.2s cubic-bezier(0.06, 0.71, 0.55, 1) 0s 1 normal forwards actionBarFadeOut',
      },
      keyframes: {
        actionBarFadeIn: {
          '0%': { transform: 'translate3d(0,50%,0) scale(.6)', opacity: '.5' },
          '100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '1' },
        },
        actionBarFadeOut: {
          '0%': { transform: 'translate3d(0,0,-1px) scale(1)', opacity: '1' },
          '100%': { transform: 'translate3d(0,50%,-1px) scale(.8)', opacity: '0' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
