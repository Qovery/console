import { render } from '@testing-library/react'

import OnboardingMore from './onboarding-more'

describe('OnboardingMore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingMore />)
    expect(baseElement).toBeTruthy()
  })
})
