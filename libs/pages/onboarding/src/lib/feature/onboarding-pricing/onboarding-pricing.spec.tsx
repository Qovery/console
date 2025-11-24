import { render } from '__tests__/utils/setup-jest'
import { IntercomProvider } from 'react-use-intercom'
import { PlanEnum } from 'qovery-typescript-axios'
import { ContextOnboarding } from '../container/container'
import OnboardingPricing from './onboarding-pricing'

describe('OnboardingPricing', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <ContextOnboarding.Provider
          value={{
            organization_name: '',
            project_name: '',
            admin_email: '',
            selectedPlan: PlanEnum.USER_2025,
            setContextValue: jest.fn(),
            cardToken: null,
            cardLast4: null,
            cardExpiryMonth: null,
            cardExpiryYear: null,
          }}
        >
          <OnboardingPricing />
        </ContextOnboarding.Provider>
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
