import { UseFormRegister, Control, Controller, ErrorOption } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText } from '@console/shared/ui'
import { Value } from '@console/shared/interfaces'
import { LOGIN_URL } from '@console/shared/utils'

interface StepPersonalizeProps {
  dataTypes: Array<Value>
  onSubmit: () => void
  register: UseFormRegister<any>
  control: Control<any, any>
  errors: { [key: string]: ErrorOption }
  defaultValues: { [x: string]: string }
  authLogout: () => void
}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { dataTypes, onSubmit, register, control, errors, defaultValues, authLogout } = props

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">To tailor your experience</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <InputText
          className="mb-3"
          name="first_name"
          label="First name"
          defaultValue={defaultValues['first_name']}
          register={register}
          required="Please enter your first name."
          error={errors && errors['first_name']?.message}
        />
        <InputText
          className="mb-3"
          name="last_name"
          label="Last name"
          defaultValue={defaultValues['last_name']}
          register={register}
          required="Please enter your last name."
          error={errors && errors['last_name']?.message}
        />
        <InputText
          className="mb-3"
          name="user_email"
          label="Professional email"
          type="email"
          defaultValue={defaultValues['user_email']}
          register={register}
          required="Please enter your email."
          error={errors && errors['user_email']?.message}
        />
        <Controller
          name="type_of_use"
          control={control}
          rules={{ required: 'Please enter your type of use.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              label="Type of use"
              items={dataTypes}
              onChange={field.onChange}
              value={field.value}
              inputRef={field.ref}
              error={error?.message}
            />
          )}
        />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            onClick={() => authLogout()}
            size={ButtonSize.BIG}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
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
