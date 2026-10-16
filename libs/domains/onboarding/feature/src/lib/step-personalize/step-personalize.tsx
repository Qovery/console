import { Controller, useFormContext } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { OnboardingForm } from '../onboarding-form/onboarding-form'

export interface ProfileFormValues {
  full_name: string
  company_name: string
  phone: string
}

export interface StepPersonalizeProps {
  onSubmit: () => void
  readOnly?: boolean
}

export function StepPersonalize({ onSubmit, readOnly = false }: StepPersonalizeProps) {
  const { control, formState } = useFormContext<ProfileFormValues>()

  return (
    <OnboardingForm
      title="Create your profile"
      description="Tell us more about yourself"
      onSubmit={onSubmit}
      loading={formState.isSubmitting}
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
