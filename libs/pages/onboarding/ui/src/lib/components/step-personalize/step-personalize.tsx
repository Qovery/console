import { Button, ButtonSize, ButtonType, InputSelect, InputText } from '@console/shared/ui'
import { Value } from '@console/shared/interfaces'
import { LOGIN_URL, ONBOARDING_COMPANY_URL, ONBOARDING_URL } from '@console/shared/utils'

interface StepPersonalizeProps {
  dataTypes: Array<Value>
  data: any
  submitForm: () => void
}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { dataTypes, submitForm, data } = props

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">To tailor your experience</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form>
        <InputText className="mb-3" name="firstName" label="First name" defaultValue={data.first_name} />
        <InputText className="mb-3" name="lastName" label="Last name" defaultValue={data.last_name} />
        <InputText
          className="mb-3"
          name="email"
          label="Professional email"
          type="email"
          defaultValue={data.user_email}
        />
        <InputSelect name="type" label="Type of use" items={dataTypes} />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button link={LOGIN_URL} size={ButtonSize.BIG} type={ButtonType.STROKED} iconLeft="icon-solid-arrow-left">
            Back
          </Button>
          {/* <Button size={ButtonSize.BIG} type={ButtonType.BASIC} link={`${ONBOARDING_URL}${ONBOARDING_COMPANY_URL}`}> */}
          <Button size={ButtonSize.BIG} type={ButtonType.BASIC} onClick={submitForm}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepPersonalize
