import { StepSignUp } from '../components/step-sign-up/step-sign-up'
import { StepPersonalize } from '../components/step-personalize/step-personalize'

export const ONBOADING_SIGN_UP_URL = '/sign-up'
export const ONBOARDING_PERSONALIZE_URL = '/personalize'

export const ROUTER_ONBOARDING = [
  {
    path: ONBOADING_SIGN_UP_URL,
    component: <StepSignUp />,
  },
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <StepPersonalize />,
  },
]
