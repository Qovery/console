import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { StepThanks } from '../../ui/step-thanks/step-thanks'

export function OnboardingThanks() {
  const { user } = useAuth0()
  const { data: userSignUp } = useUserSignUp()
  const { updateUserInfo } = useSupportChat()

  useEffect(() => {
    // Update user information used by current support chat (i.e. Intercom or Pylon)
    updateUserInfo({
      email: userSignUp?.user_email,
      name: `${userSignUp?.first_name} ${userSignUp?.last_name}`,
      userId: user?.sub,
    })
  }, [user, userSignUp, updateUserInfo])

  if (!userSignUp) return null

  return (
    <StepThanks firstName={userSignUp.first_name} email={userSignUp.user_email} dxAuth={userSignUp.dx_auth ?? false} />
  )
}

export default OnboardingThanks
