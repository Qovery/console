import { Control, Controller } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputTextArea } from '@console/shared/ui'
import { ONBOARDING_URL, ONBOARDING_PERSONALIZE_URL } from '@console/shared/utils'
import { Value } from '@console/shared/interfaces'

interface StepCompanyProps {
  dataQuestions: Array<Value>
  onSubmit: () => void
  control: Control<any, any>
}

export function StepMore(props: StepCompanyProps) {
  const { dataQuestions, onSubmit, control } = props

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">Tell us more</h1>
      <p className="text-sm mb-10 text-text-500">We need some information to proceed with your account creation.</p>
      <form onSubmit={onSubmit}>
        <Controller
          name="user_questions"
          control={control}
          rules={{ required: 'Please enter this field.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-3"
              label="Why do you want to use Qovery?"
              items={dataQuestions}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="qovery_usage"
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
            size={ButtonSize.BIG}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <Button size={ButtonSize.BIG} style={ButtonStyle.BASIC} type="submit">
            Validate
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepMore
