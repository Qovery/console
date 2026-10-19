import { Controller, useFormContext } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { OnboardingForm } from '../onboarding-form/onboarding-form'

export interface ProfileFormValues {
  full_name: string
  user_email: string
  organization_name: string
  company_name: string
  phone: string
}

export interface StepProfileProps {
  onSubmit: () => void
  loading?: boolean
  readOnly?: boolean
}

export function StepProfile({ onSubmit, loading, readOnly = false }: StepProfileProps) {
  const { control, formState } = useFormContext<ProfileFormValues>()

  return (
    <OnboardingForm
      title="Create your profile"
      description="Tell us more about yourself"
      onSubmit={onSubmit}
      loading={loading || formState.isSubmitting}
      disabled={!formState.isValid}
    >
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
        name="user_email"
        control={control}
        rules={{
          required: 'Please enter your work email.',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address.',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            {...field}
            type="email"
            label="Work email"
            autoComplete="email"
            readOnly={readOnly && !!field.value}
            error={error?.message}
          />
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
      <Controller
        name="organization_name"
        control={control}
        render={({ field }) => (
          <InputText
            {...field}
            readOnly={readOnly}
            label="Organization name (optional)"
            hint="Defaults to your company name."
          />
        )}
      />
    </OnboardingForm>
  )
}

export default StepProfile
