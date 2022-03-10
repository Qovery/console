import { render } from '@testing-library/react'

import OnboardingThanks from './onboarding-thanks'

describe('OnboardingThanks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingThanks />)
    expect(baseElement).toBeTruthy()
  })
})
