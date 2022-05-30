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

  config.env.auth0_email = process.env.CYPRESS_AUTH0_EMAIL
  config.env.auth0_password = process.env.CYPRESS_AUTH0_PASSWORD
  config.env.auth0_domain = process.env.CYPRESS_AUTH0_DOMAIN
  config.env.auth0_audience = process.env.CYPRESS_AUTH0_AUDIENCE
  config.env.auth0_client_id = process.env.CYPRESS_AUTH0_CLIENT_ID
  config.env.auth0_client_secret = process.env.CYPRESS_AUTH0_CLIENT_SECRET
  config.env.auth0_callback = process.env.CYPRESS_AUTH0_CALLBACK
  config.env.auth0_token_name = process.env.CYPRESS_AUTH0_TOKEN_NAME

  on('file:preprocessor', cucumber(options))

  return config
}
