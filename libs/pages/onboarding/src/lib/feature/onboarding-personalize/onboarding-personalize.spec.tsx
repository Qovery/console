import { render } from '__tests__/utils/setup-jest'
import OnboardingPersonalize from './onboarding-personalize'

describe('OnboardingPersonalize', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPersonalize />)
    expect(baseElement).toBeTruthy()
  })
})
