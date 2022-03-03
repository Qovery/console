import {
  ONBOARDING_COMPANY_URL,
  ONBOARDING_MORE_URL,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PRICING_URL,
  ONBOARDING_PROJECT_URL,
  Route,
} from '@console/shared/utils'
import { OnboardingPersonalize } from '../components/onboarding-personalize/onboarding-personalize'
import { OnboardingMore } from '../components/onboarding-more/onboarding-more'
import { OnboardingCompany } from '../components/onboarding-company/onboarding-company'
import { OnboardingPricing } from '../components/onboarding-pricing/onboarding-pricing'
import { OnboardingProject } from '../components/onboarding-project/onboarding-project'

export const ROUTER_ONBOARDING: Route[] = [
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <OnboardingPersonalize />,
  },
  {
    path: ONBOARDING_COMPANY_URL,
    component: <OnboardingCompany />,
  },
  {
    path: ONBOARDING_MORE_URL,
    component: <OnboardingMore />,
  },
  {
    path: ONBOARDING_PRICING_URL,
    component: <OnboardingPricing />,
  },
  {
    path: ONBOARDING_PROJECT_URL,
    component: <OnboardingProject />,
  },
]
