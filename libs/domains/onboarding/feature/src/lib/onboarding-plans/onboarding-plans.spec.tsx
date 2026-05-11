import { render } from '__tests__/utils/setup-jest'
import OnboardingPlans from './onboarding-plans'

describe('OnboardingPlans', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPlans />)
    expect(baseElement).toBeTruthy()
  })
})
