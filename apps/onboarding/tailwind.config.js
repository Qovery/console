const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind')
const { join } = require('path')

module.exports = {
  presets: [require('../../tailwind-workspace-preset.js')],
  content: [join(__dirname, '../src/**/*.{js,ts,jsx,tsx}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {},
  },
  mode: 'jit',
  plugins: [],
}
