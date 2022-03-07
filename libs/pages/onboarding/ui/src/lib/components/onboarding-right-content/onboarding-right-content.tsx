import { IconFa } from '@console/shared/ui'
import {
  ONBOARDING_PRICING_BUSINESS_URL,
  ONBOARDING_PRICING_PRO_URL,
  ONBOARDING_PROJECT_URL,
} from '@console/shared/utils'
import BenefitsCard from '../benefits-card/benefits-card'
import PlanList from '../plan-list/plan-list'

const ProList = [
  <>
    <b className="text-text-700 mr-2">24/5</b> Support
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Team members
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Projects
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Domains
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Subdomains
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Addons
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Jobs
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Services
  </>,
]

const EnterpriseList = [
  <>
    <b className="text-text-700 mr-2">24/5</b> Support
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Team members
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Projects
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Domains
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Subdomains
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Addons
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Jobs
  </>,
  <>
    <IconFa name="icon-solid-infinity" className="mr-2 text-text-700" /> Services
  </>,
]

export interface OnboardingRightContentProps {
  step: string | undefined
}

export function OnboardingRightContent(props: OnboardingRightContentProps) {
  const { step } = props

  const detectCurrentStep = (path: string) => step === path.replace('/', '')

  return (
    <div className="relative mt-32">
      {detectCurrentStep(ONBOARDING_PROJECT_URL) ? (
        <BenefitsCard />
      ) : detectCurrentStep(ONBOARDING_PRICING_PRO_URL) ? (
        <PlanList
          title="Professional plan $99/month*"
          description="Scale up with an unrestricted project and run your code in a production ready environment."
          lists={ProList}
          infos="* Price plan does not include your AWS costs"
        />
      ) : detectCurrentStep(ONBOARDING_PRICING_BUSINESS_URL) ? (
        <PlanList
          title="Enterprise plan"
          description="Scale up with an unrestricted project and run your code in a production ready environment."
          lists={EnterpriseList}
        />
      ) : (
        <img
          className="absolute top-[70px] right-[-100px] min-w-[80%] overflow-hidden pointer-events-none select-none"
          src="/assets/onboarding.png"
          alt="Qovery onboarding screen"
        />
      )}
    </div>
  )
}

export default OnboardingRightContent
