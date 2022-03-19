import { render } from '__tests__/utils/setup-jest'

import OnboardingCompany from './onboarding-company'

describe('OnboardingCompany', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingCompany />)
    expect(baseElement).toBeTruthy()
  })
})
