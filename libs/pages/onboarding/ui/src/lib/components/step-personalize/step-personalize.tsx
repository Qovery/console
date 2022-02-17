import { Link } from 'react-router-dom'
import { ONBOARDING_URL } from '@console/shared/utils'
import { ONBOADING_SIGN_UP_URL } from '../../router/router'

/* eslint-disable-next-line */
export interface StepPersonalizeProps {}

export function StepPersonalize(props: StepPersonalizeProps) {
  return (
    <div>
      <h1>Welcome to StepPersonalize!</h1>
      <Link to={`${ONBOARDING_URL}${ONBOADING_SIGN_UP_URL}`}>Prev step</Link>
    </div>
  )
}

export default StepPersonalize
