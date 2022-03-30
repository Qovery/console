import { useEffect } from 'react'
import { useIntercom } from 'react-use-intercom'
import { useUser } from '@console/domains/user'
import { StepThanks } from '@console/pages/onboarding/ui'

export function OnboardingThanks() {
  const { user, userSignUp } = useUser()
  const { update } = useIntercom()

  useEffect(() => {
    // if (process.env['NODE_ENV'] === 'production') {
    // update user intercom
    update({
      email: userSignUp.user_email,
      name: `${userSignUp.first_name} ${userSignUp.last_name}`,
      userId: user.sub,
    })
    // }
  }, [user, userSignUp, update])

  return <StepThanks firstName={userSignUp.first_name || ''} email={userSignUp.user_email || ''} />
}

export default OnboardingThanks
