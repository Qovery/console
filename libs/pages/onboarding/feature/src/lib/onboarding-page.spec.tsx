import { render } from '@testing-library/react'

import OnboardingPage from './onboarding-page'

describe('OnboardingPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingPage />)
    expect(baseElement).toBeTruthy()
  })
})
