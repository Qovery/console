import { render } from '@testing-library/react'

import OnboardingProjectPage from './onboarding-project-page'

describe('OnboardingProjectPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingProjectPage />)
    expect(baseElement).toBeTruthy()
  })
})
