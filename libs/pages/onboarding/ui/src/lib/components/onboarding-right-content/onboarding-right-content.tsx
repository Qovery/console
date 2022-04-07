import {
  ONBOARDING_PRICING_BUSINESS_URL,
  ONBOARDING_PRICING_ENTERPRISE_URL,
  ONBOARDING_PRICING_FREE_URL,
  ONBOARDING_PRICING_PRO_URL,
  ONBOARDING_PROJECT_URL,
} from '@console/shared/utils'
import BenefitsCard from '../benefits-card/benefits-card'
import PlanList from '../plan-list/plan-list'

const FreeList = [
  <span>Deploy on your AWS account</span>,
  <span>3 users</span>,
  <span>Up to 10 applications</span>,
  <span>Github, and Gitlab auto-deploy</span>,
  <span>Managed infrastructure</span>,
  <span>Community support (forum)</span>,
]

const ProList = [
  <span>All FREE features</span>,
  <span>15 users included</span>,
  <span>Unlimited applications</span>,
  <span>Application auto-scaling</span>,
  <span>Preview environment (optional)</span>,
  <span>24/5 support (email and chat)</span>,
]

const BusinessList = [
  <span>All PROFESSIONAL features</span>,
  <span>30 users included</span>,
  <span>Multi clusters</span>,
  <span>Single Sign-On (SSO)</span>,
  <span>Cloud cost optimization</span>,
  <span>Priority support</span>,
]

const EnterpriseList = [
  <span>Extended security and compliance</span>,
  <span>Hybrid cloud</span>,
  <span>24/7 support</span>,
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
      ) : detectCurrentStep(ONBOARDING_PRICING_FREE_URL) ? (
        <PlanList title="Free" description="Start to deploy your apps on your cloud account" lists={FreeList} />
      ) : detectCurrentStep(ONBOARDING_PRICING_PRO_URL) ? (
        <PlanList
          title="Professional plan $49/month"
          description="Ideal for scaling apps and growing teams"
          lists={ProList}
        />
      ) : detectCurrentStep(ONBOARDING_PRICING_BUSINESS_URL) ? (
        <PlanList
          title="Business plan $599/month"
          description="Ideal for better security and compliance"
          lists={BusinessList}
        />
      ) : detectCurrentStep(ONBOARDING_PRICING_ENTERPRISE_URL) ? (
        <PlanList
          title="Enterprise plan"
          description="Scale up with an unrestricted project and run your code in a production ready environment."
          lists={EnterpriseList}
        />
      ) : (
        <img
          className="absolute top-[70px] w-full overflow-hidden pointer-events-none select-none"
          src="/assets/onboarding.png"
          alt="Qovery onboarding screen"
        />
      )}
    </div>
  )
}

export default OnboardingRightContent
