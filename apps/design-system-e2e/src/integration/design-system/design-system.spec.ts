describe('design-system: DesignSystem component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=designsystem--primary'))

  it('should render the component', () => {
    cy.get('h1').should('contain', 'Welcome to DesignSystem!')
  })
})
