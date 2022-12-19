import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useIntercom } from 'react-use-intercom'
import { selectUser, selectUserSignUp } from '@qovery/domains/user'
import { StepThanks } from '../../ui/step-thanks/step-thanks'

export function OnboardingThanks() {
  const user = useSelector(selectUser)
  const userSignUp = useSelector(selectUserSignUp)
  const { update } = useIntercom()

  useEffect(() => {
    // update user intercom
    update({
      email: userSignUp?.user_email,
      name: `${userSignUp?.first_name} ${userSignUp?.last_name}`,
      userId: user.sub,
    })
  }, [user, userSignUp, update])

  return (
    <StepThanks
      firstName={userSignUp?.first_name || ''}
      email={userSignUp?.user_email || ''}
      dxAuth={userSignUp?.dx_auth || false}
    />
  )
}

export default OnboardingThanks
