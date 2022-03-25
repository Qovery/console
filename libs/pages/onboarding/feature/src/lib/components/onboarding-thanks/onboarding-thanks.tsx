import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useIntercom } from 'react-use-intercom'
import { useUser } from '@console/domains/user'
import { StepThanks } from '@console/pages/onboarding/ui'

export function OnboardingThanks() {
  const { user, userSignUp } = useUser()
  const { update } = useIntercom()

  useEffect(() => {
    // update user posthog
    posthog.identify(user.sub, {
      first_name: userSignUp.first_name,
      last_name: userSignUp.last_name,
      email: userSignUp.user_email,
      company_name: userSignUp.company_name,
    })
    // update user intercom
    update({
      email: userSignUp.user_email,
      name: `${userSignUp.first_name} ${userSignUp.last_name}`,
      userId: user.sub,
    })
  }, [user, userSignUp, update])

  return <StepThanks firstName={userSignUp.first_name || ''} email={userSignUp.user_email || ''} />
}

export default OnboardingThanks
