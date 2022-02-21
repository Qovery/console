import { InputSelect, InputText } from '@console/shared-ui'
import { ONBOARDING_COMPANY_URL, ONBOARDING_URL, useAuth, useDocumentTitle } from '@console/shared/utils'
import { Link } from 'react-router-dom'

export function StepPersonalize() {
  const { authLogout } = useAuth()

  useDocumentTitle('Onboarding Personalize - Qovery')

  const data = [
    {
      label: 'Personal',
      value: 'personal',
    },
    {
      label: 'Work',
      value: 'work',
    },
    {
      label: 'School',
      value: 'school',
    },
  ]

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">To personalize your experience</h1>
      <p className="text-sm mb-10 text-text-500">
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
        velit mollit. Exercitation veniam consequat sunt nostrud amet.
      </p>
      <form>
        <InputText className="mb-3" name="firstName" label="First name" />
        <InputText className="mb-3" name="lastName" label="Last name" />
        <InputText className="mb-3" name="email" label="Email" type="email" />
        <InputSelect className="mb-3" name="type" label="Type of use" items={data} />
        <span className="mr-4" onClick={() => authLogout()}>
          Logout
        </span>
        <Link to={`${ONBOARDING_URL}${ONBOARDING_COMPANY_URL}`}>Continue</Link>
      </form>
    </div>
  )
}

export default StepPersonalize
