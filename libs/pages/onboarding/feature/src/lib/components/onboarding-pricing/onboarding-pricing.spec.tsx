import { render } from '@testing-library/react'

import OnboardingPricing from './onboarding-pricing'

describe('OnboardingPricing', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPricing />)
    expect(baseElement).toBeTruthy()
  })
})
