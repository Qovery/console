import { Controller, useFormContext } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { OnboardingForm } from '../onboarding-form/onboarding-form'

export interface StepProjectProps {
  onSubmit: () => void
  loading?: boolean
  onFirstStepBack?: () => void
}

export function StepProject({ onSubmit, loading, onFirstStepBack }: StepProjectProps) {
  const { formState } = useFormContext()

  return (
    <OnboardingForm
      title="Create your organization"
      description="Name your organization and its first project"
      onSubmit={onSubmit}
      loading={loading}
      disabled={!formState.isValid}
      onBack={onFirstStepBack}
    >
      <Controller
        name="organization_name"
        rules={{ validate: (value: string) => !!value?.trim() || 'Please enter your organization name.' }}
        render={({ field, fieldState: { error } }) => (
          <InputText {...field} label="Organization name" error={error?.message} />
        )}
      />
      <Controller
        name="project_name"
        rules={{ validate: (value: string) => !!value?.trim() || 'Please enter your project name.' }}
        render={({ field, fieldState: { error } }) => (
          <InputText {...field} label="Project name" error={error?.message} />
        )}
      />
    </OnboardingForm>
  )
}

export default StepProject
