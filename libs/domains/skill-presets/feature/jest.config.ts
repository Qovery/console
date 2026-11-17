module.exports = {
  displayName: 'domains-skill-presets-feature',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // The pages run against the in-memory mock API, with its latency: slower on shared CI runners.
  testTimeout: 20000,
  coverageDirectory: '../../../../coverage/libs/domains/skill-presets/feature',
}
