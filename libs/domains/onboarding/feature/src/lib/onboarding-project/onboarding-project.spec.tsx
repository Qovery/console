import { renderWithProviders } from '@qovery/shared/util-tests'
import OnboardingProject from './onboarding-project'

describe('OnboardingProject', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<OnboardingProject />)
    expect(baseElement).toBeTruthy()
  })
})
