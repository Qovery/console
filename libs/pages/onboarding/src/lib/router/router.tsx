import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_PROJECT_URL, type Route } from '@qovery/shared/routes'
import { OnboardingPersonalize } from '../feature/onboarding-personalize/onboarding-personalize'
import { OnboardingProject } from '../feature/onboarding-project/onboarding-project'

export const ROUTER_ONBOARDING: Route[] = [
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <OnboardingPersonalize />,
  },
  {
    path: ONBOARDING_PROJECT_URL,
    component: <OnboardingProject />,
  },
]
