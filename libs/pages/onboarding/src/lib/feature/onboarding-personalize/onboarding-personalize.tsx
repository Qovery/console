import { useDocumentTitle } from '@qovery/shared/util-hooks'
import FormUser from '../form-user/form-user'

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')
  return <FormUser />
}

export default OnboardingPersonalize
