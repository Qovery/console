import { render } from '__tests__/utils/setup-jest'
import { IntercomProvider } from 'react-use-intercom'
import OnboardingThanks from './onboarding-thanks'

describe('OnboardingThanks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <OnboardingThanks />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
