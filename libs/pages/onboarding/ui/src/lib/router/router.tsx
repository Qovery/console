import { ONBOARDING_PERSONALIZE_URL } from '@console/shared/utils'
import { StepPersonalize } from '../components/step-personalize/step-personalize'

export const ROUTER_ONBOARDING = [
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <StepPersonalize />,
  },
]
