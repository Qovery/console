import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useUser } from '@console/domains/user'
import { StepThanks } from '@console/pages/onboarding/ui'

export function OnboardingThanks() {
  const { user, userSignUp } = useUser()

  useEffect(() => {
    // update user posthog
    posthog.identify(user.sub, {
      first_name: userSignUp.last_name,
      last_name: userSignUp.last_name,
      email: userSignUp.user_email,
      company_name: userSignUp.company_name,
    })
  }, [user, userSignUp])

  return <StepThanks firstName={userSignUp.first_name || ''} email={userSignUp.user_email || ''} />
}

export default OnboardingThanks
