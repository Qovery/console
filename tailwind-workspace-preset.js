const colorsZinc = {
  50: '#FFFFFF',
  100: '#F8F9FC',
  150: '#EDF1F7',
  200: '#E2E9F3',
  250: '#C6D3E7',
  300: '#A0AFC5',
  350: '#67778E',
  400: '#383E50',
  500: '#2A3041',
  550: '#212738',
  600: '#1A2031',
  650: '#151B2B',
  700: '#101420',
  800: '#0B0E16',
  900: '#000000',
}

const colorsIndigo = {
  50: '#F2F3FE',
  100: '#E0DDFC',
  200: '#C2BCFA',
  300: '#A097F2',
  400: '#847AE6',
  500: '#5B50D6',
  600: '#433AB8',
  700: '#2F289A',
  800: '#1F197C',
  900: '#130F66',
}

const colorsBrand = {
  1: 'var(--brand-1)',
  2: 'var(--brand-2)',
  3: 'var(--brand-3)',
  4: 'var(--brand-4)',
  5: 'var(--brand-5)',
  6: 'var(--brand-6)',
  7: 'var(--brand-7)',
  8: 'var(--brand-8)',
  9: 'var(--brand-9)',
  10: 'var(--brand-10)',
  11: 'var(--brand-11)',
  12: 'var(--brand-12)',
}

const slideEntrances = () => {
  const genSlide = (suffix, offset) => ({
    [`slidein-up-${suffix}`]: {
      from: { transform: `translateY(${offset})` },
      to: { transform: 'translateY(0)' },
    },
    [`slidein-left-${suffix}`]: {
      from: { transform: `translateX(-${offset})` },
      to: { transform: 'translateX(0)' },
    },
    [`slidein-right-${suffix}`]: {
      from: { transform: `translateX(${offset})` },
      to: { transform: 'translateX(0)' },
    },
    [`slidein-down-${suffix}`]: {
      from: { transform: `translateY(-${offset})` },
      to: { transform: 'translateY(0)' },
    },
  })
  return {
    ...genSlide('sm', '4px'),
    ...genSlide('md', '8px'),
  }
}

const slideExits = () => {
  const genSlide = (suffix, offset) => ({
    [`slideout-up-${suffix}`]: {
      from: { transform: 'translateY(0)' },
      to: { transform: `translateY(-${offset})` },
    },
    [`slideout-left-${suffix}`]: {
      from: { transform: 'translateX(0)' },
      to: { transform: `translateX(-${offset})` },
    },
    [`slideout-right-${suffix}`]: {
      from: { transform: 'translateX(0)' },
      to: { transform: `translateX(${offset})` },
    },
    [`slideout-down-${suffix}`]: {
      from: { transform: 'translateY(0)' },
      to: { transform: `translateY(${offset})` },
    },
  })
  return {
    ...genSlide('sm', '4px'),
    ...genSlide('md', '8px'),
  }
}

const easingFunctions = {
  // https://gist.github.com/argyleink/36e1c0153d2a783d513bd29c9f25aaf2
  'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'ease-out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
}

// tailwind-workspace-preset.js
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      zIndex: {
        header: 'var(--header-zindex)',
        dropdown: 'var(--dropdown-zindex)',
        overlay: 'var(--overlay-zindex)',
        modal: 'var(--modal-zindex)',
        tooltip: 'var(--tooltip-zindex)',
        toast: 'var(--toast-zindex)',
      },
      transitionProperty: {
        label: 'transform, font-size',
      },
      spacing: {
        'right-help-sidebar': '22.5rem',
        'navbar-height': '4rem',
      },
      maxWidth: {
        'content-with-navigation-left': '44.5rem',
      },
      minHeight: {
        'page-container': 'calc(100vh - theme(spacing.navbar-height))',
        'page-container-wbanner': 'calc(100vh - theme(spacing.navbar-height) - 40px)',
        'page-container-wprogressbar': 'calc(100vh - theme(spacing.navbar-height) - 6px)',
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'sans-serif'],
        code: ['Hack', 'sans-serif'],
        icons: ['FontAwesome'],
      },
      fontSize: {
        '3xs': [
          '0.5rem',
          {
            lineHeight: '1rem',
          },
        ],
        '2xs': [
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
        brand: { ...colorsBrand, ...colorsIndigo },
        indigo: colorsIndigo,
        purple: {
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
        sky: {
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
        teal: {
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
        green: {
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
        orange: {
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
        yellow: {
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
        red: {
          50: '#FFFAF6',
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
        zink: colorsZinc,
        neutral: colorsZinc,
        background: {
          DEFAULT: 'var(--background-1)',
          secondary: 'var(--background-2)',
          overlay: 'var(--background-overlay)',
        },
        surface: {
          neutral: {
            DEFAULT: 'var(--neutral-1)',
            subtle: 'var(--neutral-2)',
            component: 'var(--neutral-3)',
            componentHover: 'var(--neutral-4)',
            componentActive: 'var(--neutral-5)',
            solid: 'var(--neutral-9)',
            contrasted: 'var(--contrast)',
          },
          neutralInvert: {
            DEFAULT: 'var(--neutral-invert-1)',
            subtle: 'var(--neutral-invert-2)',
            component: 'var(--neutral-invert-3)',
          },
          brand: {
            solid: 'var(--brand-9)',
            solidHover: 'var(--brand-10)',
            component: 'var(--brand-3)',
            subtle: 'var(--brand-2)',
          },
          negative: {
            solid: 'var(--negative-9)',
            solidHover: 'var(--negative-10)',
            component: 'var(--negative-3)',
            subtle: 'var(--negative-2)',
          },
          positive: {
            solid: 'var(--positive-9)',
            solidHover: 'var(--positive-10)',
            component: 'var(--positive-3)',
            subtle: 'var(--positive-2)',
          },
          warning: {
            solid: 'var(--warning-9)',
            solidHover: 'var(--warning-10)',
            component: 'var(--warning-3)',
            subtle: 'var(--warning-2)',
          },
          info: {
            solid: 'var(--info-9)',
            solidHover: 'var(--info-10)',
            component: 'var(--info-3)',
            subtle: 'var(--info-2)',
          },
          accent1: {
            solid: 'var(--accent-9)',
            component: 'var(--accent-3)',
          },
        },
      },
      textColor: {
        neutral: {
          DEFAULT: 'var(--neutral-12)',
          subtle: 'var(--neutral-11)',
          disabled: 'var(--neutral-10)',
          contrasted: 'var(--contrast)',
        },
        neutralInvert: {
          DEFAULT: 'var(--neutral-invert-12)',
          subtle: 'var(--neutral-invert-11)',
          contrasted: 'var(--contrast-inverted)',
        },
        brand: { DEFAULT: 'var(--brand-11)', hover: 'var(--brand-10)' },
        info: { DEFAULT: 'var(--info-11)', hover: 'var(--info-10)' },
        infoInvert: { DEFAULT: 'var(--info-invert-11)' },
        positive: { DEFAULT: 'var(--positive-11)', hover: 'var(--positive-10)' },
        positiveInvert: { DEFAULT: 'var(--positive-invert-11)' },
        negative: { DEFAULT: 'var(--negative-11)', hover: 'var(--negative-10)' },
        negativeInvert: { DEFAULT: 'var(--negative-invert-11)' },
        warning: { DEFAULT: 'var(--warning-11)', hover: 'var(--warning-10)' },
        warningInvert: { DEFAULT: 'var(--warning-invert-11)' },
        accent1: { DEFAULT: 'var(--accent-11)', hover: 'var(--accent1-10)' },
      },
      borderColor: {
        neutral: {
          DEFAULT: 'var(--neutral-6)',
          component: 'var(--neutral-7)',
          strong: 'var(--neutral-9)',
        },
        neutralInvert: {
          DEFAULT: 'var(--neutral-invert-6)',
        },
        brand: {
          strong: 'var(--brand-9)',
          component: 'var(--brand-alpha-7)',
          subtle: 'var(--brand-6)',
        },
        info: {
          strong: 'var(--info-9)',
          component: 'var(--info-alpha-7)',
          subtle: 'var(--info-6)',
        },
        positive: {
          strong: 'var(--positive-9)',
          component: 'var(--positive-alpha-7)',
          subtle: 'var(--positive-6)',
        },
        negative: {
          strong: 'var(--negative-9)',
          component: 'var(--negative-alpha-7)',
          subtle: 'var(--negative-6)',
        },
        warning: {
          strong: 'var(--warning-9)',
          component: 'var(--warning-alpha-7)',
          subtle: 'var(--warning-6)',
        },
        accent1: {
          strong: 'var(--accent-9)',
          subtle: 'var(--accent-6)',
        },
      },
      outlineColor: ({ theme }) => theme('borderColor'),
      animation: {
        'action-bar-fade-in': '0.35s cubic-bezier(0.21, 1.02, 0.73, 1) 0s 1 normal forwards actionBarFadeIn',
        'action-bar-fade-out': '0.2s cubic-bezier(0.06, 0.71, 0.55, 1) 0s 1 normal forwards actionBarFadeOut',

        'slidein-up-sm-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-up-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,
        'slidein-right-sm-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-right-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,
        'slidein-down-sm-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-down-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,
        'slidein-left-sm-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-left-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,

        'slidein-up-md-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-up-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,
        'slidein-right-md-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-right-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,
        'slidein-down-md-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-down-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,
        'slidein-left-md-faded': `400ms ${easingFunctions['ease-out-quart']} 0s slidein-left-sm, 200ms ${easingFunctions['ease-out-quart']} 0s fadein`,

        fadein: `0.35s ${easingFunctions['ease-in-quad']} 0s fadein both`,
        fadeout: `0.2s ${easingFunctions['ease-out-quad']} 0s fadeout both`,

        'ping-small': 'pingSmall 1s linear infinite',
        'loader-dots': 'loaderDots 2s linear infinite',
      },
      keyframes: {
        actionBarFadeIn: {
          '0%': { transform: 'translate3d(0,50%,0) scale(.6)', opacity: '0.5' },
          '100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '1' },
        },
        actionBarFadeOut: {
          '0%': { transform: 'translate3d(0,0,-1px) scale(1)', opacity: '1' },
          '100%': { transform: 'translate3d(0,50%,-1px) scale(.8)', opacity: '0' },
        },
        fadein: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeout: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        showAssistantTrigger: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        shineAssistantTrigger: {
          from: { transform: 'translate(-200px,-50px) rotate(60deg)' },
          to: { transform: 'translate(200px,-50px) rotate(60deg)' },
        },
        pingSmall: {
          '75%, 100%': {
            transform: 'scale(1.75)',
            opacity: '0',
          },
        },
        shake: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(8deg)' },
          '50%': { transform: 'rotate(0eg)' },
          '75%': { transform: 'rotate(-8deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        backgroundLinear: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        loaderDots: {
          '0%': {
            boxShadow: '0px 0 transparent, 0px 0 transparent, 0px 0 transparent, 0px 0 transparent',
          },
          '12%': {
            boxShadow: '100px 0 var(--neutral-5), 0px 0 transparent, 0px 0 transparent, 0px 0 transparent',
          },
          '25%': {
            boxShadow: '110px 0 var(--neutral-5), 100px 0 var(--neutral-5), 0px 0 transparent, 0px 0 transparent',
          },
          '36%': {
            boxShadow:
              '120px 0 var(--neutral-5), 110px 0 var(--neutral-5), 100px 0 var(--neutral-5), 0px 0 transparent',
          },
          '50%': {
            boxShadow:
              '130px 0 var(--neutral-5), 120px 0 var(--neutral-5), 110px 0 var(--neutral-5), 100px 0 var(--neutral-5)',
          },
          '62%': {
            boxShadow:
              '200px 0 transparent, 130px 0 var(--neutral-5), 120px 0 var(--neutral-5), 110px 0 var(--neutral-5)',
          },
          '75%': {
            boxShadow: '200px 0 transparent, 200px 0 transparent, 130px 0 var(--neutral-5), 120px 0 var(--neutral-5)',
          },
          '87%': {
            boxShadow: '200px 0 transparent, 200px 0 transparent, 200px 0 transparent, 130px 0 var(--neutral-5)',
          },
          '100%': {
            boxShadow: '200px 0 transparent, 200px 0 transparent, 200px 0 transparent, 200px 0 transparent',
          },
        },
        'shiny-text': {
          '0%': {
            'background-position': 'calc(-100% - var(--shiny-width)) 0',
          },
          '100%': {
            'background-position': 'calc(100% + var(--shiny-width)) 0',
          },
        },
        scalein: {
          '0%': {
            opacity: 0,
            transform: 'scale(.98)',
          },
          to: {
            opacity: 1,
            transform: 'scale(1)',
          },
        },
        ...slideEntrances(),
        ...slideExits(),
      },
    },
  },
  safelist: [
    {
      pattern: /grid-cols-(2|3|4|5|6|7|8|9|10)/,
    },
    {
      pattern: /col-span-(2|3|4|5|6|7|8|9|10)/,
    },
  ],
  variants: {
    extend: {
      after: ['last'],
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('retina', '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)')
    },
  ],
}
