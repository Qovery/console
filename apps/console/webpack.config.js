const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin')
const { useLegacyNxPlugin } = require('@nx/webpack')

// This file was migrated using @nx/webpack:convert-config-to-webpack-plugin from your './webpack.config.old.js'
// Please check that the options here are correct as they were moved from the old webpack.config.js to this file.
const options = {}

/**
 * @type{import('webpack').WebpackOptionsNormalized}
 */
module.exports = async () => ({
  plugins: [
    new NxAppWebpackPlugin(),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
    // NOTE: useLegacyNxPlugin ensures that the non-standard Webpack configuration file previously used still works.
    // To remove its usage, move options such as "plugins" into this file as standard Webpack configuration options.
    // To enhance configurations after Nx plugins have applied, you can add a new plugin with the \`apply\` method.
    // e.g. \`{ apply: (compiler) => { /* modify compiler.options */ }\`
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useLegacyNxPlugin(require('./webpack.config.old'), options),
  ],
})
