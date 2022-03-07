import { StepPersonalize } from '@console/pages/onboarding/ui'
import { useDocumentTitle } from '@console/shared/utils'

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')

  const dataTypes = [
    {
      label: 'Personal',
      value: 'personal',
    },
    {
      label: 'Work',
      value: 'work',
    },
    {
      label: 'School',
      value: 'school',
    },
  ]

  return <StepPersonalize dataTypes={dataTypes} />
}

export default OnboardingPersonalize
