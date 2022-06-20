import {
  ONBOARDING_MORE_URL,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PRICING_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_THANKS_URL,
  Route,
} from '@console/shared/router'
import { OnboardingPersonalize } from '../feature/onboarding-personalize/onboarding-personalize'
import { OnboardingMore } from '../feature/onboarding-more/onboarding-more'
import { OnboardingPricing } from '../feature/onboarding-pricing/onboarding-pricing'
import { OnboardingProject } from '../feature/onboarding-project/onboarding-project'
import { OnboardingThanks } from '../feature/onboarding-thanks/onboarding-thanks'

export const ROUTER_ONBOARDING_STEP_1: Route[] = [
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <OnboardingPersonalize />,
  },
  {
    path: ONBOARDING_MORE_URL,
    component: <OnboardingMore />,
  },
  {
    path: ONBOARDING_THANKS_URL,
    component: <OnboardingThanks />,
  },
]

export const ROUTER_ONBOARDING_STEP_2: Route[] = [
  {
    path: ONBOARDING_PROJECT_URL,
    component: <OnboardingProject />,
  },
  {
    path: `${ONBOARDING_PRICING_URL}/:plan`,
    component: <OnboardingPricing />,
  },
]
