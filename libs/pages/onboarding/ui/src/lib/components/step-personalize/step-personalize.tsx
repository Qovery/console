import { ONBOARDING_COMPANY_URL, ONBOARDING_URL, useAuth, useDocumentTitle } from '@console/shared/utils'
import { Link } from 'react-router-dom'
import LayoutOnboarding from '../layout-onboarding/layout-onboarding'

///* eslint-disable-next-line */
export interface StepPersonalizeProps {}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { authLogout } = useAuth()

  useDocumentTitle('Onboarding Personalize - Qovery')

  return (
    <LayoutOnboarding>
      <div>
        <h1 className="h3 text-text-700 mb-3">To personalize your experience</h1>
        <p className="text-sm mb-10 text-text-500">
          Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
          velit mollit. Exercitation veniam consequat sunt nostrud amet.
        </p>
        <button className="mr-4" onClick={() => authLogout()}>
          Logout
        </button>
        <Link to={`${ONBOARDING_URL}${ONBOARDING_COMPANY_URL}`}>Continue</Link>
      </div>
    </LayoutOnboarding>
  )
}

export default StepPersonalize
