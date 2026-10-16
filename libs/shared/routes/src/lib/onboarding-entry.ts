import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from './sub-router/onboarding.router'

export function getOnboardingEntryUrl() {
  return `${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`
}
