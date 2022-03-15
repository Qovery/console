import { SubmitHandler, UseFormRegister } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText } from '@console/shared/ui'
import { FormPersonalize, Value } from '@console/shared/interfaces'
import { LOGIN_URL, ONBOARDING_COMPANY_URL, ONBOARDING_URL } from '@console/shared/utils'

interface StepPersonalizeProps {
  dataTypes: Array<Value>
  data: FormPersonalize
  onSubmit: () => void
  register: UseFormRegister<any>
}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { dataTypes, data, onSubmit, register } = props

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">To tailor your experience</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <InputText
          className="mb-3"
          name="first_name"
          label="First name"
          defaultValue={data.first_name}
          register={register}
          required
        />
        <InputText
          className="mb-3"
          name="last_name"
          label="Last name"
          defaultValue={data.last_name}
          register={register}
          required
        />
        <InputText
          className="mb-3"
          name="user_email"
          label="Professional email"
          type="email"
          defaultValue={data.user_email}
          register={register}
          required
        />
        <InputSelect name="type" label="Type of use" items={dataTypes} />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button link={LOGIN_URL} size={ButtonSize.BIG} style={ButtonStyle.STROKED} iconLeft="icon-solid-arrow-left">
            Back
          </Button>
          <Button size={ButtonSize.BIG} style={ButtonStyle.BASIC} type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepPersonalize
