import { type TypeOfUseEnum } from 'qovery-typescript-axios'
import { type Control, Controller } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Button, Icon, InputSelect, InputText } from '@qovery/shared/ui'

export interface StepPersonalizeProps {
  dataTypes: Array<Value>
  dataCloudProviders: Array<Value>
  onSubmit: () => void
  control: Control<{
    first_name: string
    last_name: string
    user_email: string
    type_of_use: TypeOfUseEnum
    infrastructure_hosting: string
  }>
  authLogout: () => void
}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { dataTypes, onSubmit, control, authLogout, dataCloudProviders } = props

  return (
    <div className="pb-10">
      <h1 className="h3 mb-3 text-neutral-400">To tailor your experience</h1>
      <p className="mb-10 text-sm text-neutral-400">We need some information to proceed with your account creation.</p>
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
              className="mb-3"
              label="Type of use"
              options={dataTypes}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="infrastructure_hosting"
          control={control}
          rules={{ required: 'Please enter your infrastructure hosting.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              label="Current infrastructure hosting"
              options={dataCloudProviders}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <div className="mt-10 flex justify-between border-t border-neutral-200 pt-5">
          <Button
            className="gap-2"
            type="button"
            color="neutral"
            variant="surface"
            size="lg"
            onClick={() => authLogout()}
          >
            <Icon name="icon-solid-arrow-left" />
            Disconnect
          </Button>
          <Button type="submit" size="lg">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepPersonalize
