const { join } = require('path')

module.exports = {
  // Build configuration shares the workspace preset outside the library source graph.
  // eslint-disable-next-line @nx/enforce-module-boundaries
  presets: [require('../../../tailwind-workspace-preset.js')],
  // Resolve from this file so the glob matches whatever the cwd is (Nx runs Storybook from the project root).
  content: [join(__dirname, 'src/**/*.{js,jsx,ts,tsx}')],
  mode: 'jit',
  theme: {
    extend: {},
  },
  plugins: [],
}
