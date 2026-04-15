import { getOnboardingEntryUrl } from './onboarding-entry'
import { ONBOARDING_PROJECT_URL, ONBOARDING_URL } from './sub-router/onboarding.router'

describe('getOnboardingEntryUrl', () => {
  it('should redirect new signups to project creation', () => {
    expect(getOnboardingEntryUrl()).toBe(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  })

  it('should redirect signups with completed personalize data to project creation', () => {
    expect(
      getOnboardingEntryUrl({
        first_name: 'Ada',
        last_name: 'Lovelace',
        user_email: 'ada@qovery.com',
        qovery_usage: 'i-want-to-easily-deploy-my-new-project',
      })
    ).toBe(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  })

  it('should redirect signups with personalize progress to project creation', () => {
    expect(getOnboardingEntryUrl({ current_step: 'personalize' })).toBe(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  })

  it('should redirect dx_auth signups to project creation', () => {
    expect(getOnboardingEntryUrl({ dx_auth: true })).toBe(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  })

  it('should redirect billing-complete signups to project creation', () => {
    expect(getOnboardingEntryUrl({ current_step: 'billing' })).toBe(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  })

  it('should redirect project-progress signups to project creation', () => {
    expect(getOnboardingEntryUrl({ current_step: 'project' })).toBe(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  })
})
