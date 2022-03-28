import { render } from '__tests__/utils/setup-jest'

import OnboardingThanks from './onboarding-thanks'

describe('OnboardingThanks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingThanks />)
    expect(baseElement).toBeTruthy()
  })
})
