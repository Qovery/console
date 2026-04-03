import { renderWithProviders } from '@qovery/shared/util-tests'
import OnboardingProject from './onboarding-project'

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  useGTMDispatch: () => jest.fn(),
}))

describe('OnboardingProject', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<OnboardingProject />)
    expect(baseElement).toBeTruthy()
  })
})
