import { Control, Controller } from 'react-hook-form'
import { Value } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText } from '@qovery/shared/ui'

export interface StepPersonalizeProps {
  dataTypes: Array<Value>
  onSubmit: () => void
  control: Control<any, any>
  authLogout: () => void
}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { dataTypes, onSubmit, control, authLogout } = props

  return (
    <div className="pb-10">
      <h1 className="h3 text-text-700 mb-3">To tailor your experience</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <Controller
          name="first_name"
          control={control}
          rules={{ required: 'Please enter your first name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="First name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="last_name"
          control={control}
          rules={{ required: 'Please enter your last name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Last name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="user_email"
          control={control}
          rules={{ required: 'Please enter your email.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Email"
              type="email"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="type_of_use"
          control={control}
          rules={{ required: 'Please enter your type of use.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              label="Type of use"
              options={dataTypes}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            onClick={() => authLogout()}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Disconnect
          </Button>
          <Button size={ButtonSize.XLARGE} style={ButtonStyle.BASIC} type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepPersonalize
