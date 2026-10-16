import { Controller, useFormContext } from 'react-hook-form'
import { Button, InputText } from '@qovery/shared/ui'
import arrowRight from './assets/arrow-right.svg'
import { isPersonalEmail } from './personal-email-domains'

export interface ProfileFormValues {
  full_name: string
  user_email: string
  company_name: string
  organization_name: string
  phone: string
}

export interface StepPersonalizeProps {
  onSubmit: () => void
  needsProfessionalEmail?: boolean
}

export function StepPersonalize({ onSubmit, needsProfessionalEmail = false }: StepPersonalizeProps) {
  const { control, formState } = useFormContext<ProfileFormValues>()

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-[620px] w-full max-w-[480px] flex-col justify-between gap-6 rounded-2xl border border-neutral bg-background p-6 shadow-lg"
    >
      <div className="flex flex-col gap-6">
        <div
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={1}
          aria-valuetext="Step 1 of 3"
          className="flex gap-2"
        >
          <span className="h-1 flex-1 rounded-2xl bg-surface-brand-solid" />
          <span className="h-1 flex-1 rounded-2xl border border-brand-subtle bg-surface-brand-component" />
          <span className="h-1 flex-1 rounded-2xl border border-brand-subtle bg-surface-brand-component" />
        </div>
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
              <InputText {...field} label="Full name" autoComplete="name" error={error?.message} />
            )}
          />
          <Controller
            name="company_name"
            control={control}
            rules={{ validate: (value) => !!value.trim() || 'Please enter your company name.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText {...field} label="Company name" autoComplete="organization" error={error?.message} />
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
              <InputText {...field} label="Phone number (optional)" autoComplete="tel" error={error?.message} />
            )}
          />
          <Controller
            name="organization_name"
            control={control}
            rules={{ validate: (value) => !!value.trim() || 'Please enter your organization name.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText {...field} label="Organization name" error={error?.message} />
            )}
          />
          {needsProfessionalEmail && (
            <Controller
              name="user_email"
              control={control}
              rules={{
                required: 'Please enter your email.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address.',
                },
                validate: (value) => !isPersonalEmail(value) || 'Please enter your professional email address.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  {...field}
                  label="Professional email address"
                  type="email"
                  autoComplete="email"
                  error={error?.message}
                />
              )}
            />
          )}
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
        <img src={arrowRight} alt="" className="dark:invert" />
      </Button>
    </form>
  )
}

export default StepPersonalize
