import { type Control, Controller } from 'react-hook-form'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Button, Icon, InputTextArea, Link } from '@qovery/shared/ui'

export interface StepMoreProps {
  onSubmit: () => void
  control: Control<{
    user_questions?: string
  }>
}

export function StepMore(props: StepMoreProps) {
  const { onSubmit, control } = props

  return (
    <div className="pb-10">
      <h1 className="h3 mb-3 text-neutral-400">Tell us more</h1>
      <p className="mb-10 text-sm text-neutral-400">We need more information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
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
