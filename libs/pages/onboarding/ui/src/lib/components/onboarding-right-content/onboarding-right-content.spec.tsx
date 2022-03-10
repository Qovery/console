import { render } from '@testing-library/react'

import OnboardingRightContent from './onboarding-right-content'

describe('OnboardingRightContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingRightContent />)
    expect(baseElement).toBeTruthy()
  })
})
