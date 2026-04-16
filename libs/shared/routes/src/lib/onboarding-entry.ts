import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL } from './sub-router/onboarding.router'

export interface OnboardingUserSignUpState {
  current_step?: string | null
  first_name?: string | null
  last_name?: string | null
  user_email?: string | null
  company_name?: string | null
  qovery_usage?: string | null
  infrastructure_hosting?: string | null
}

function hasCompletedPersonalize(userSignUp?: OnboardingUserSignUpState | null) {
  return Boolean(
    userSignUp?.first_name &&
      userSignUp?.last_name &&
      userSignUp?.user_email &&
      userSignUp?.company_name &&
      userSignUp?.qovery_usage &&
      userSignUp?.infrastructure_hosting
  )
}

export function getOnboardingEntryUrl(userSignUp?: OnboardingUserSignUpState | null) {
  const nextStep = hasCompletedPersonalize(userSignUp) ? ONBOARDING_PROJECT_URL : ONBOARDING_PERSONALIZE_URL

  return `${ONBOARDING_URL}${nextStep}`
}
