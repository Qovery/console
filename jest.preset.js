const nxPreset = require('@nx/jest/preset').default
const path = require('path')

module.exports = {
  setupFilesAfterEnv: [path.join(__dirname, '__tests__/mocks.ts'), 'jest-canvas-mock'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['./node_modules/', './.next/', './__tests__/utils/setup-jest.tsx'],
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!pretty-bytes|color|color-string).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  resetMocks: true,
  ...nxPreset,
  // Must come after nxPreset (which sets html only). Paths are written relative to the
  // workspace root so Codecov can map them to repo files.
  coverageReporters: ['text-summary', ['lcov', { projectRoot: __dirname }]],
}
