export const isMediumScreen = () => {
  return Cypress.config('viewportWidth') < Cypress.env('mediumScreenViewportWidthBreakpoint')
}

export const isMobile = () => {
  return Cypress.config('viewportWidth') < Cypress.env('mobileViewportWidthBreakpoint')
}
