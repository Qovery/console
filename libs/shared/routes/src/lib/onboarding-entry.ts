import { ONBOARDING_PROJECT_URL, ONBOARDING_URL } from './sub-router/onboarding.router'

export interface OnboardingUserSignUpState {
  current_step?: string | null
  first_name?: string | null
  last_name?: string | null
  user_email?: string | null
  qovery_usage?: string | null
}

export function getOnboardingEntryUrl(_userSignUp?: OnboardingUserSignUpState | null) {
  return `${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`
}
