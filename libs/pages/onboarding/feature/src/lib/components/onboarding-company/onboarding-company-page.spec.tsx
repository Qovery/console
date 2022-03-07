import { render } from '@testing-library/react'

import OnboardingCompany from './onboarding-company'

describe('OnboardingCompany', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingCompany />)
    expect(baseElement).toBeTruthy()
  })
})
