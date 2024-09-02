const nxPreset = require('@nx/jest/preset').default

module.exports = {
  setupFilesAfterEnv: ['./__tests__/mocks.ts', 'jest-canvas-mock'],
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['./node_modules/', './.next/', './__tests__/utils/setup-jest.tsx'],
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!pretty-bytes).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  resetMocks: true,
  ...nxPreset,
}
