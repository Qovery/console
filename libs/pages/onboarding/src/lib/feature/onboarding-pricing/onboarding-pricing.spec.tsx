import { ResizeObserver } from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { IntercomProvider } from 'react-use-intercom'
import OnboardingPricing from './onboarding-pricing'

describe('OnboardingPricing', () => {
  window.ResizeObserver = ResizeObserver
  it('should render successfully', () => {
    const { baseElement } = render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <OnboardingPricing />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
