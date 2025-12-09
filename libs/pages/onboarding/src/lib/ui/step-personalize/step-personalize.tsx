import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Button, Icon, InputSelect, InputText, InputTextArea } from '@qovery/shared/ui'

export interface StepPersonalizeProps {
  dataCloudProviders: Array<Value>
  dataQoveryUsage: Array<Value>
  onSubmit: () => void
  authLogout: () => void
}

export function StepPersonalize(props: StepPersonalizeProps) {
  const { onSubmit, authLogout, dataCloudProviders, dataQoveryUsage } = props
  const { control, formState, setValue, watch } = useFormContext()
  const isQoveryUsageOther = watch('qovery_usage') === 'other'

  return (
    <div className="mx-auto max-w-content-with-navigation-left pb-10">
      <h1 className="h3 mb-3 text-neutral-400">To tailor your experience</h1>
      <p className="mb-10 text-sm text-neutral-400">We need some information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <div className="mb-3 flex gap-3">
          <Controller
            name="first_name"
            control={control}
            rules={{ required: 'Please enter your first name.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="w-full"
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
                className="w-full"
                label="Last name"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
              />
            )}
          />
        </div>
        <Controller
          name="user_email"
          control={control}
          rules={{
            required: 'Please enter your email.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Email address"
              type="email"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="company_name"
          control={control}
          rules={{ required: 'Please enter your company name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Company name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="qovery_usage"
          control={control}
          rules={{ required: 'Please enter this field.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-3"
              label="Why do you want to use Qovery? I want to..."
              options={dataQoveryUsage}
              onChange={(value) => {
                field.onChange(value)
                if (value !== 'other') {
                  setValue('qovery_usage_other', undefined, {
                    shouldDirty: false,
                    shouldValidate: true,
                  })
                }
              }}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        {isQoveryUsageOther && (
          <Controller
            name="qovery_usage_other"
            control={control}
            rules={{ required: false }}
            render={({ field }) => (
              <InputTextArea
                className="mb-3"
                label="Precise us why you want to use Qovery"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
        )}
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
          <Button type="submit" size="lg" disabled={!formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepPersonalize
