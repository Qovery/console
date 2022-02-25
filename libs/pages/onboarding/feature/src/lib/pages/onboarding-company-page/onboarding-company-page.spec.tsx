import { render } from '@testing-library/react'

import OnboardingCompanyPage from './onboarding-company-page'

describe('OnboardingCompanyPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingCompanyPage />)
    expect(baseElement).toBeTruthy()
  })
})
