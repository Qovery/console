import { getOnboardingEntryUrl } from './onboarding-entry'

describe('getOnboardingEntryUrl', () => {
  it('opens the single setup screen for a new signup', () => {
    expect(getOnboardingEntryUrl()).toBe('/onboarding/personalize')
  })
})
