import { renderWithProviders } from '@qovery/shared/util-tests'
import OnboardingThanks from './onboarding-thanks'

describe('OnboardingThanks', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<OnboardingThanks />)
    expect(baseElement).toBeTruthy()
  })
})
