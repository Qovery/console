import { render } from '@testing-library/react'

import OnboardingPricingPage from './onboarding-pricing-page'

describe('OnboardingPricingPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPricingPage />)
    expect(baseElement).toBeTruthy()
  })
})
