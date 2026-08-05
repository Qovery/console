import { Controller, useFormContext } from 'react-hook-form'
import { Button, Icon, InputText } from '@qovery/shared/ui'
import { isPersonalEmail } from './personal-email-domains'

export interface StepPersonalizeProps {
  onSubmit: () => void
  authLogout: () => void
}

export function StepPersonalize({ onSubmit, authLogout }: StepPersonalizeProps) {
  const { control, formState } = useFormContext()

  return (
    <div className="mx-auto max-w-content-with-navigation-left pb-10">
      <h1 className="h3 mb-3 text-neutral">To tailor your experience</h1>
      <p className="mb-10 text-sm text-neutral">
        We need a few details to tailor your experience. Continuing creates a brand-new organization, so ask your team
        for an invitation if they already have one.
      </p>
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
            validate: (value: string) => !isPersonalEmail(value) || 'Please enter your professional email address.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Professional email address"
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
          name="phone"
          control={control}
          rules={{
            required: false,
            pattern: {
              value: /^[\d\s+\-()]{7,}$/,
              message: 'Please enter a valid phone number.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              label="Phone (recommended)"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <p className="mt-10 text-sm text-neutral-subtle">
          Already part of an organization on Qovery?{' '}
          <button type="button" className="text-brand hover:underline" onClick={() => authLogout()}>
            Sign in with a different account
          </button>{' '}
          if you signed up with a different provider last time.
        </p>
        <div className="mt-5 flex justify-between border-t border-surface-neutral-subtle pt-5">
          <Button type="button" color="neutral" variant="surface" size="lg" onClick={() => authLogout()}>
            <Icon iconName="arrow-left" />
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
