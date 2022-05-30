import { Before, Given, Then, When } from 'cypress-cucumber-preprocessor/steps'

Before(() => {
  cy.visit('/login')
})

When('I click on the privacy policy link', () => {
  cy.get('[data-cy=privacy-policy-link]').click()
})

Then('I should be to the privacy policy', () => {
  cy.url().should('contain', '/')
})

When('I click on the deploy app doc link', () => {
  cy.get('[data-cy=deploy-app-link]').click()
})

Then('I should be to the deploy app doc', () => {
  cy.url().should('contain', '/')
})

When('I click on the instant preview link', () => {
  cy.get('[data-cy=instant-preview-link]').click()
})

Then('I should be to the instant preview', () => {
  cy.url().should('contain', '/')
})

When('I click on the reduce cloud doc link', () => {
  cy.get('[data-cy=reduce-cloud-cost-link]').click()
})

Then('I should be to the reduce cloud doc', () => {
  cy.url().should('contain', '/')
})

When('I click on the boost team experience link', () => {
  cy.get('[data-cy=boost-team-experience-link]').click()
})

Then('I should be to the boost team experience', () => {
  cy.url().should('contain', '/')
})

When('I click on the github button', () => {
  cy.get('[data-cy=github-btn]').click()
})

Given('I am logged with auth0', () => {
  cy.loginByAuth0Api(Cypress.env('auth0_email'), Cypress.env('auth0_password'))
})

Then('I should see the onboarding', () => {
  cy.get('[data-cy=right-section]').should('be.visible')
})

Given('The screen size is medium', () => {
  cy.viewport(1200, 900)
})

Then('Right section should be hidden', () => {
  cy.get('[data-cy=right-section]').should('be.hidden')
})
