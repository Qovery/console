import { render } from '__tests__/utils/setup-jest'

import OnboardingRightContent from './onboarding-right-content'

describe('OnboardingRightContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingRightContent />)
    expect(baseElement).toBeTruthy()
  })
})
