import { ONBOARDING_PROJECT_URL } from '@qovery/shared/routes'

export interface OnboardingRightContentProps {
  step: string | undefined
}

export function OnboardingRightContent(props: OnboardingRightContentProps) {
  const { step } = props

  const detectCurrentStep = (path: string) => step === path.replace('/', '')

  return <div>{detectCurrentStep(ONBOARDING_PROJECT_URL)}</div>
}

export default OnboardingRightContent
