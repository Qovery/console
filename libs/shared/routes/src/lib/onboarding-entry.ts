import {
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PLANS_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_URL,
} from './sub-router/onboarding.router'

export interface OnboardingUserSignUpState {
  current_step?: string | null
  dx_auth?: boolean | null
  first_name?: string | null
  last_name?: string | null
  user_email?: string | null
  qovery_usage?: string | null
}

export function getOnboardingEntryUrl(userSignUp?: OnboardingUserSignUpState | null) {
  if (userSignUp?.dx_auth || userSignUp?.current_step === 'billing') {
    return `${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`
  }

  const hasCompletedPersonalize = Boolean(
    userSignUp?.first_name && userSignUp?.last_name && userSignUp?.user_email && userSignUp?.qovery_usage
  )

  if (userSignUp?.current_step === 'personalize' || hasCompletedPersonalize) {
    return `${ONBOARDING_URL}${ONBOARDING_PLANS_URL}`
  }

  return `${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`
}
