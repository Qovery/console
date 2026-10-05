module.exports = {
  // Build configuration shares the workspace preset outside the library source graph.
  // eslint-disable-next-line @nx/enforce-module-boundaries
  presets: [require('../../../tailwind-workspace-preset.js')],
  content: ['libs/shared/ui/src/**/*.{js,jsx,ts,tsx}'],
  mode: 'jit',
  theme: {
    extend: {},
  },
  plugins: [],
}
