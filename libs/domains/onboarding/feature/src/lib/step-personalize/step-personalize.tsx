import { Controller, useFormContext } from 'react-hook-form'
import { Button, Icon, InputText } from '@qovery/shared/ui'

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
    <form
      onSubmit={onSubmit}
      className="flex min-h-[620px] w-full max-w-[480px] flex-col justify-between gap-6 rounded-2xl border border-neutral bg-background p-6 shadow-lg"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="mb-2 font-brand text-[28px] font-normal leading-9 text-neutral">Create your profile</h1>
          <p className="text-base text-neutral-subtle">Tell us more about yourself</p>
        </div>
        <div className="flex flex-col gap-4 [&_.input]:min-h-12 [&_.input]:py-1.5">
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
        </div>
      </div>
      <Button
        type="submit"
        size="lg"
        color="neutral"
        className="w-full justify-center text-base"
        loading={formState.isSubmitting}
        disabled={!formState.isValid || formState.isSubmitting}
      >
        Continue
        <Icon iconName="arrow-right" />
      </Button>
    </form>
  )
}

export default StepPersonalize
