import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useIntercom } from 'react-use-intercom'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { StepThanks } from '../../ui/step-thanks/step-thanks'

export function OnboardingThanks() {
  const { user } = useAuth0()
  const { data: userSignUp } = useUserSignUp()
  const { update } = useIntercom()

  useEffect(() => {
    // update user intercom
    update({
      email: userSignUp?.user_email,
      name: `${userSignUp?.first_name} ${userSignUp?.last_name}`,
      userId: user?.sub,
    })
  }, [user, userSignUp, update])

  if (!userSignUp) return null

  return (
    <StepThanks firstName={userSignUp.first_name} email={userSignUp.user_email} dxAuth={userSignUp.dx_auth ?? false} />
  )
}

export default OnboardingThanks
