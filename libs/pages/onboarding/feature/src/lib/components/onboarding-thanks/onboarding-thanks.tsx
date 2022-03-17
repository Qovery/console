import { useNavigate } from 'react-router'
import { useUser } from '@console/domains/user'
import { StepThanks } from '@console/pages/onboarding/ui'
import { ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@console/shared/utils'

export function OnboardingThanks() {
  const { userSignUp, updateUserSignUp } = useUser()
  const navigate = useNavigate()

  // need to be removed
  const nextStep = () => {
    updateUserSignUp({ ...userSignUp, dx_auth: true })
    navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
  }

  return <StepThanks firstName={userSignUp.first_name || ''} email={userSignUp.user_email || ''} nextStep={nextStep} />
}

export default OnboardingThanks
