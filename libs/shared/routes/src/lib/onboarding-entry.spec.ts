import { getOnboardingEntryUrl } from './onboarding-entry'

describe('getOnboardingEntryUrl', () => {
  it('opens the single setup screen for a new signup', () => {
    expect(getOnboardingEntryUrl()).toBe('/onboarding/personalize')
  })

  it.each(['personalize', 'use-cases', 'billing', 'project'])(
    'does not resume the removed steps for a saved %s signup',
    (current_step) => {
      expect(
        getOnboardingEntryUrl({
          first_name: 'John',
          last_name: 'Doe',
          user_email: 'john@acme.com',
          company_name: 'Acme',
          current_step,
        })
      ).toBe('/onboarding/personalize')
    }
  )
})
