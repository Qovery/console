import { ONBOARDING_URL } from '@console/shared/utils'
import { Link } from 'react-router-dom'
import { ONBOARDING_PERSONALIZE_URL } from '../../router/router'

export function StepSignUp() {
  return (
    <div>
      <h1>Welcome to Qovery</h1>
      <p>
        By registering and using Qovery, you agree to the processing of your personal data by Qovery as described in the
        <a href="/">Privacy Policy</a>.
      </p>
      <Link to={`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`}>Next step</Link>
    </div>
  )
}

export default StepSignUp
