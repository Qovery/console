import {
  ONBOARDING_COMPANY_URL,
  ONBOARDING_MORE_URL,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PRICING_URL,
  Route,
} from '@console/shared/utils'
import { OnboardingPersonalizePage } from '../pages/onboarding-personalize-page/onboarding-personalize-page'
import { OnboardingMorePage } from '../pages/onboarding-more-page/onboarding-more-page'
import { OnboardingCompanyPage } from '../pages/onboarding-company-page/onboarding-company-page'
import { OnboardingPricingPage } from '../pages/onboarding-pricing-page/onboarding-pricing-page'

export const ROUTER_ONBOARDING: Route[] = [
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <OnboardingPersonalizePage />,
  },
  {
    path: ONBOARDING_COMPANY_URL,
    component: <OnboardingCompanyPage />,
  },
  {
    path: ONBOARDING_MORE_URL,
    component: <OnboardingMorePage />,
  },
  {
    path: ONBOARDING_PRICING_URL,
    component: <OnboardingPricingPage />,
  },
]
