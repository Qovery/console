import { StepProject } from '@console/pages/onboarding/ui'
import { useDocumentTitle } from '@console/shared/utils'

export function OnboardingProject() {
  useDocumentTitle('Onboarding Project - Qovery')

  return <StepProject />
}

export default OnboardingProject
