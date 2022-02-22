const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  setupFilesAfterEnv: ['./__tests__/config/setup-tests.ts'],
  testPathIgnorePatterns: ['./node_modules/', './.next/', './__tests__/test-utils.tsx'],
  ...nxPreset,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
    '^.+\\.scss$': 'jest-scss-transform',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  resetMocks: true,
}
