import { ONBOARDING_COMPANY_URL, ONBOARDING_PERSONALIZE_URL } from '@console/shared/utils'
import { StepCompany } from '../components/step-company/step-company'
import { StepPersonalize } from '../components/step-personalize/step-personalize'

export const ROUTER_ONBOARDING = [
  {
    path: ONBOARDING_PERSONALIZE_URL,
    component: <StepPersonalize />,
  },
  {
    path: ONBOARDING_COMPANY_URL,
    component: <StepCompany />,
  },
]
