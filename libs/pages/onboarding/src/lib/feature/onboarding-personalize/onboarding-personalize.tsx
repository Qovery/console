import { useState } from 'react'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import FormCompany from '../form-company/form-company'
import FormUser from '../form-user/form-user'

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')
  const [stepCompany, setStepCompany] = useState(false)

  if (!stepCompany) {
    return <FormUser setStepCompany={setStepCompany} />
  } else {
    return <FormCompany setStepCompany={setStepCompany} />
  }
}

export default OnboardingPersonalize
