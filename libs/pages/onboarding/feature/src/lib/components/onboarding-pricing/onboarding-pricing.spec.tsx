import { render } from '__tests__/utils/setup-jest'

import OnboardingPricing from './onboarding-pricing'

describe('OnboardingPricing', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPricing />)
    expect(baseElement).toBeTruthy()
  })
})
