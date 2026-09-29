const { join } = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../tailwind-workspace-preset.js')],
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    // Explicit globs instead of createGlobPatternsForDependencies: that helper needs the Nx project graph,
    // which is not available when vite is run directly (Dockerfile) and silently yields no lib classes.
    join(__dirname, '../../libs/**/*!(*.stories|*.spec).{ts,tsx,html}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
