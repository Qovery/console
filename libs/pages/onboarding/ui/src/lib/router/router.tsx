import {
  ONBOARDING_COMPANY_URL,
  ONBOARDING_MORE_URL,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PRICING_URL,
} from '@console/shared/utils'
import { StepMore } from '../components/step-more/step-more'
import { StepCompany } from '../components/step-company/step-company'
import { StepPersonalize } from '../components/step-personalize/step-personalize'
import { StepPricing } from '../components/step-pricing/step-pricing'

export const ROUTER_ONBOARDING = [
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <StepPersonalize />,
  },
  {
    path: ONBOARDING_COMPANY_URL,
    component: <StepCompany />,
  },
  {
    path: ONBOARDING_MORE_URL,
    component: <StepMore />,
  },
  {
    path: ONBOARDING_PRICING_URL,
    component: <StepPricing />,
  },
]
