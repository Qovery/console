import { render } from '@testing-library/react'

import OnboardingMorePage from './onboarding-more-page'

describe('OnboardingMorePage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingMorePage />)
    expect(baseElement).toBeTruthy()
  })
})
