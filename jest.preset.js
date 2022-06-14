const nxPreset = require('@nrwl/jest/preset')
const path = require('path')
console.log('CONFIG INITIALISATION JEST PRESET ========')
module.exports = {
  setupFilesAfterEnv: ['/__tests__/mocks.ts'],
  collectCoverageFrom: ['libs/**/*.{js,jsx,ts,tsx}', '!libs/**/*.d.ts'],
  testMatch: ['./libs/**/__tests__/**/*.{js,jsx,ts,tsx}', './libs/**/*.{spec,test}.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['./node_modules/', './.next/', './__tests__/utils/setup-jest.tsx'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { configFile: path.resolve(__dirname, '.babelrc') }],
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  resetMocks: true,
  ...nxPreset,
}
