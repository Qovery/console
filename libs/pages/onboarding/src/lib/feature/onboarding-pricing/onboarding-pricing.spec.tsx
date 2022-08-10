import { render } from '__tests__/utils/setup-jest'

import OnboardingPricing from './onboarding-pricing'
import { IntercomProvider } from 'react-use-intercom'

describe('OnboardingPricing', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <OnboardingPricing />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
