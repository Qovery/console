import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],

  // '@nx/react/plugins/storybook' is provided by NX
  // eslint-disable-next-line storybook/no-uninstalled-addons
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes', '@nx/react/plugins/storybook'],

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  staticDirs: [
    '../src/lib',
    { from: '../../../../node_modules/@awesome.me/kit-c4457d1be4/icons/webfonts', to: '/assets/fonts/font-awesome' },
  ],

  typescript: {
    // https://storybook.js.org/blog/storybook-8/#improved-react-and-vue-control-autogeneration
    // https://storybook.js.org/docs/api/main-config-typescript#reactdocgen
    // https://github.com/storybookjs/storybook/issues/26496
    reactDocgen: 'react-docgen-typescript',
  },

  docs: {
    autodocs: true,
  },
}

export default config

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
