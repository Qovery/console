import { useUser } from '@console/domains/user'
import { StepThanks } from '@console/pages/onboarding/ui'

export function OnboardingThanks() {
  const { userSignUp } = useUser()

  return (
    <StepThanks
      firstName={userSignUp.first_name || ''}
      email={userSignUp.user_email || ''}
      isAuth={userSignUp.dx_auth || false}
    />
  )
}

export default OnboardingThanks
