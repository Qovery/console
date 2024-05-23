import { type Control, Controller } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Button, Icon, InputSelect, InputTextArea, Link } from '@qovery/shared/ui'

export interface StepMoreProps {
  dataQuestions: Array<Value>
  onSubmit: () => void
  control: Control<{
    user_questions?: string
    qovery_usage: string
    qovery_usage_other?: string
    where_to_deploy?: string
  }>
  displayQoveryUsageOther: boolean
}

export function StepMore(props: StepMoreProps) {
  const { dataQuestions, onSubmit, control, displayQoveryUsageOther } = props

  return (
    <div className="pb-10">
      <h1 className="h3 mb-3 text-neutral-400">Tell us more</h1>
      <p className="mb-10 text-sm text-neutral-400">We need more information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <Controller
          name="qovery_usage"
          control={control}
          rules={{ required: 'Please enter this field.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-3"
              label="Why do you want to use Qovery? I want to..."
              options={dataQuestions}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        {displayQoveryUsageOther && (
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
          name="user_questions"
          control={control}
          rules={{ required: false }}
          render={({ field }) => (
            <InputTextArea
              className="mb-3"
              label="Any questions or recommendations?"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <div className="mt-10 flex justify-between border-t border-neutral-200 pt-5">
          <Link
            as="button"
            to={`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`}
            className="gap-2"
            type="button"
            color="neutral"
            variant="surface"
            size="lg"
          >
            <Icon name="icon-solid-arrow-left" />
            Back
          </Link>
          <Button type="submit" size="lg">
            Validate
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepMore
