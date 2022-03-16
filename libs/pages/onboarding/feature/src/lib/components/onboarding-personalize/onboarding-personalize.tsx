import { useState } from 'react'
import { useDocumentTitle } from '@console/shared/utils'
import FormUser from '../form-user/form-user'
import FormCompany from '../form-company/form-company'

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')
  const [stepCompany, setStepCompany] = useState(true)

  if (!stepCompany) {
    return <FormUser setStepCompany={setStepCompany} />
  } else {
    return <FormCompany setStepCompany={setStepCompany} />
  }
}

export default OnboardingPersonalize
