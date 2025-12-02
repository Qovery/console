const nxPreset = require('@nx/jest/preset').default
const path = require('path')

const fileMock = path.join(__dirname, '__mocks__/fileMock.js')

module.exports = {
  setupFilesAfterEnv: [path.join(__dirname, '__tests__/mocks.ts'), 'jest-canvas-mock'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['./node_modules/', './.next/', './__tests__/utils/setup-jest.tsx'],
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!pretty-bytes).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '\\.(mp3)$': fileMock,
  },
  resetMocks: true,
  ...nxPreset,
}
