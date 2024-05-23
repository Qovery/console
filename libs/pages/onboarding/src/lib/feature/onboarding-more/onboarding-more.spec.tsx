import { render } from '__tests__/utils/setup-jest'
import OnboardingMore from './onboarding-more'

describe('OnboardingMore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingMore />)
    expect(baseElement).toBeTruthy()
  })
})
