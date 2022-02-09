module.exports = {
  presets: [require('../../../tailwind-workspace-preset.js')],
  content: ['libs/shared/ui/src/**/*.{js,jsx,ts,tsx}'],
  mode: 'jit',
  theme: {
    extend: {},
  },
  plugins: [],
}
