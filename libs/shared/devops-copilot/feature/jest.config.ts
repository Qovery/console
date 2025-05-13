/* eslint-disable */
export default {
  displayName: 'shared-devops-copilot-feature',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: ['node_modules/(?!mermaid)'], // XXX: We need to transform the ESM module 'mermaid' because Jest ignores node_modules by default
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/shared/devops-copilot/feature',
}
