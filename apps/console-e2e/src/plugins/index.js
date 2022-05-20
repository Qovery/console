const browserify = require('@cypress/browserify-preprocessor')
const cucumber = require('cypress-cucumber-preprocessor').default
const path = require('path')

module.exports = (on, config) => {
  const options = {
    ...browserify.defaultOptions,
    typescript: path.join(path.resolve('../..'), 'node_modules/typescript'),
  }

  config = {
    env: {},
  }

  config.env.auth0_domain = process.env.NX_OAUTH_DOMAIN
  config.env.auth0_audience = process.env.NX_OAUTH_AUDIENCE
  config.env.auth0_client_id = process.env.NX_OAUTH_KEY
  config.env.auth0_email = 'gaultieromon+test@gmail.com'
  config.env.auth0_password = '1Verycomplicatedpassword'

  on('file:preprocessor', cucumber(options))

  return config
}
