import {
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_URL,
  ONBOARDING_USE_CASES_URL,
} from './sub-router/onboarding.router'

export interface OnboardingUserSignUpState {
  current_step?: string | null
  first_name?: string | null
  last_name?: string | null
  user_email?: string | null
  company_name?: string | null
  user_questions?: string | null
  qovery_usage?: string | null
}

function hasCompletedPersonalize(userSignUp?: OnboardingUserSignUpState | null) {
  return Boolean(userSignUp?.first_name && userSignUp?.last_name && userSignUp?.user_email && userSignUp?.company_name)
}

export function getOnboardingEntryUrl(userSignUp?: OnboardingUserSignUpState | null) {
  if (!hasCompletedPersonalize(userSignUp)) {
    return `${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`
  }
  if (userSignUp?.current_step === 'project') {
    return `${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`
  }
  return `${ONBOARDING_URL}${ONBOARDING_USE_CASES_URL}`
}
