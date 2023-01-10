import { ONBOARDING_PROJECT_URL } from '@qovery/shared/routes'
import BenefitsCard from '../benefits-card/benefits-card'

export interface OnboardingRightContentProps {
  step: string | undefined
}

export function OnboardingRightContent(props: OnboardingRightContentProps) {
  const { step } = props

  const detectCurrentStep = (path: string) => step === path.replace('/', '')

  return (
    <div>
      {detectCurrentStep(ONBOARDING_PROJECT_URL) ? (
        <BenefitsCard />
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
