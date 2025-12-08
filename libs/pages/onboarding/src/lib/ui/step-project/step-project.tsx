import { type Control, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ONBOARDING_PLANS_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Button, Icon, InputText } from '@qovery/shared/ui'

export interface StepProjectProps {
  onSubmit: () => void
  control: Control<{
    organization_name: string
    project_name: string
  }>
  loading?: boolean
  onFirstStepBack?: () => void
}

export function StepProject(props: StepProjectProps) {
  const { onSubmit, control, loading, onFirstStepBack } = props
  const navigate = useNavigate()

  return (
    <div className="pb-10">
      <h1 className="h3 mb-3 text-neutral-400">
        Create your Organization
        <span className="ml-2" role="img" aria-label="star">
          ✨
        </span>
      </h1>
      <p className="mb-10 text-sm text-neutral-400">
        You will now create your Organization and a first project within it. Both the Organization and Project name can
        be edited afterwards.
      </p>
      <form onSubmit={onSubmit}>
        <Controller
          name="organization_name"
          control={control}
          rules={{ required: 'Please enter your organization name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Organization name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="project_name"
          control={control}
          rules={{ required: 'Please enter your project name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Project name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <div className="mt-10 flex justify-between border-t border-neutral-200 pt-5">
          <Button
            type="button"
            size="lg"
            color="neutral"
            variant="surface"
            className="gap-2"
            onClick={() => (onFirstStepBack ? onFirstStepBack() : navigate(`${ONBOARDING_URL}${ONBOARDING_PLANS_URL}`))}
          >
            <Icon name="icon-solid-arrow-left" />
            Back
          </Button>
          <Button type="submit" size="lg" loading={loading}>
            {loading ? 'Creating…' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepProject
