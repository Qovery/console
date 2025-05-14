import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import OnboardingThanks from './onboarding-thanks'

describe('OnboardingThanks', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <OnboardingThanks />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
