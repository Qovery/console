import { render } from '@testing-library/react'

import OnboardingProject from './onboarding-project'

describe('OnboardingProject', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingProject />)
    expect(baseElement).toBeTruthy()
  })
})
