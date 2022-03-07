import { render } from '@testing-library/react'

import OnboardingPersonalize from './onboarding-personalize'

describe('OnboardingPersonalize', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPersonalize />)
    expect(baseElement).toBeTruthy()
  })
})
