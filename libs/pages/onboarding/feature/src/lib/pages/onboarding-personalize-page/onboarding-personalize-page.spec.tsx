import { render } from '@testing-library/react'

import OnboardingPersonalizePage from './onboarding-personalize-page'

describe('OnboardingPersonalizePage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPersonalizePage />)
    expect(baseElement).toBeTruthy()
  })
})
