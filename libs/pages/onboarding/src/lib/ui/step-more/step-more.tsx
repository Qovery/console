import { Control, Controller } from 'react-hook-form'
import { Value } from '@qovery/shared/interfaces'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputTextArea } from '@qovery/shared/ui'

export interface StepMoreProps {
  dataQuestions: Array<Value>
  onSubmit: () => void
  control: Control<any, any>
  displayQoveryUsageOther: boolean
}

export function StepMore(props: StepMoreProps) {
  const { dataQuestions, onSubmit, control, displayQoveryUsageOther } = props

  return (
    <div className="pb-10">
      <h1 className="h3 text-text-700 mb-3">Tell us more</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <Controller
          name="qovery_usage"
          control={control}
          rules={{ required: 'Please enter this field.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-3"
              label="Why do you want to use Qovery?"
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
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <Button size={ButtonSize.XLARGE} style={ButtonStyle.BASIC} type="submit">
            Validate
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepMore
