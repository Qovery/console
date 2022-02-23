import { Button, ButtonSize, ButtonType, InputSelect, InputText } from '@console/shared-ui'
import { LOGIN_URL, ONBOARDING_COMPANY_URL, ONBOARDING_URL, useDocumentTitle } from '@console/shared/utils'

export function StepPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')

  const dataTypes = [
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
        <InputSelect name="type" label="Type of use" items={dataTypes} />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button link={LOGIN_URL} size={ButtonSize.BIG} type={ButtonType.STROKED} iconLeft="icon-solid-arrow-left">
            Back
          </Button>
          <Button size={ButtonSize.BIG} type={ButtonType.BASIC} link={`${ONBOARDING_URL}${ONBOARDING_COMPANY_URL}`}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepPersonalize
