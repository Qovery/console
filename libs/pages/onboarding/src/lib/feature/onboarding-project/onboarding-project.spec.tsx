import { render } from '__tests__/utils/setup-jest'
import OnboardingProject from './onboarding-project'

describe('OnboardingProject', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingProject />)
    expect(baseElement).toBeTruthy()
  })
})
