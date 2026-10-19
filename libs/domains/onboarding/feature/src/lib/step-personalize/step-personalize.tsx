import { Controller, useFormContext } from 'react-hook-form'
import { Button, Callout, Icon, InputText } from '@qovery/shared/ui'
import { OnboardingForm } from '../onboarding-form/onboarding-form'

export interface ProfileFormValues {
  full_name: string
  company_name: string
  phone: string
}

export interface StepPersonalizeProps {
  onSubmit: () => void
  loading?: boolean
  readOnly?: boolean
  disabled?: boolean
  onSignIn?: () => void
}

export function StepPersonalize({ onSubmit, loading, readOnly = false, disabled, onSignIn }: StepPersonalizeProps) {
  const { control, formState } = useFormContext<ProfileFormValues>()

  return (
    <OnboardingForm
      title="Create your profile"
      description="Tell us more about yourself"
      onSubmit={onSubmit}
      loading={loading || formState.isSubmitting}
      disabled={disabled || !formState.isValid}
    >
      {onSignIn && (
        <Callout.Root color="red" role="alert">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextDescription>
              We couldn’t retrieve your email address. Please sign in again to continue.
            </Callout.TextDescription>
            <Button type="button" variant="plain" color="neutral" onClick={onSignIn}>
              Sign in again
            </Button>
          </Callout.Text>
        </Callout.Root>
      )}
      <Controller
        name="full_name"
        control={control}
        rules={{
          validate: (value) => value.trim().split(/\s+/).length >= 2 || 'Please enter your first and last name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText {...field} readOnly={readOnly} label="Full name" autoComplete="name" error={error?.message} />
        )}
      />
      <Controller
        name="company_name"
        control={control}
        rules={{ validate: (value) => !!value.trim() || 'Please enter your company name.' }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            {...field}
            readOnly={readOnly}
            label="Company name"
            autoComplete="organization"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="phone"
        control={control}
        rules={{
          pattern: {
            value: /^[\d\s+\-()]{7,}$/,
            message: 'Please enter a valid phone number.',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            {...field}
            readOnly={readOnly}
            label="Phone number (optional)"
            autoComplete="tel"
            error={error?.message}
          />
        )}
      />
    </OnboardingForm>
  )
}

export default StepPersonalize
