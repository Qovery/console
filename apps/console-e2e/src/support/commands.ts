import jwtDecode, { JwtPayload } from 'jwt-decode'

interface JwtPayloadExtended extends JwtPayload {
  nickname: string
  name: string
  picture: string
  updated_at: Date
  email: string
  email_verified: boolean
}
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      loginByAuth0Api(username: string, password: string): void
    }
  }
}

Cypress.Commands.add('loginByAuth0Api', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })

  const domain = Cypress.env('auth0_domain')
  const audience = Cypress.env('auth0_audience')
  const client_id = Cypress.env('auth0_client_id')
  const client_secret = Cypress.env('auth0_client_secret')
  const grant_type = 'password'
  const scope = 'openid profile email'

  cy.request({
    method: 'POST',
    url: `https://${domain}/oauth/token`,
    body: {
      grant_type,
      username,
      password,
      audience,
      scope,
      client_id,
      client_secret,
    },
  }).then(({ body }) => {
    const claims = jwtDecode<JwtPayloadExtended>(body.id_token)
    const { nickname, name, picture, updated_at, email, email_verified, sub, exp } = claims

    const item = {
      body: {
        ...body,
        decodedToken: {
          claims,
          user: {
            nickname,
            name,
            picture,
            updated_at,
            email,
            email_verified,
            sub,
          },
          client_id,
        },
      },
      expiresAt: exp,
    }

    window.localStorage.setItem('auth0Cypress', JSON.stringify(item))

    log.snapshot('after')
    log.end()

    cy.visit('/')
  })
})
