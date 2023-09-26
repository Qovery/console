import { type FormEventHandler, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { JobConfigureSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import { ButtonLegacy, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface StepConfigureProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onBack: () => void
  jobType: JobType
}

export function StepConfigure(props: StepConfigureProps) {
  const { formState, watch } = useFormContext<JobConfigureData>()
  const [isValid, setIsValid] = useState(true)

  watch((data) => {
    if (props.jobType === ServiceTypeEnum.LIFECYCLE_JOB) {
      setIsValid(Boolean(data.on_start?.enabled || data.on_stop?.enabled || data.on_delete?.enabled))
    }
  })

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-neutral-400 text-lg mb-2">Job configuration</h3>
        <p className="text-neutral-400 text-sm mb-2">
          Job configuration allows you to control the behaviour of your job
        </p>
      </div>

      <JobConfigureSettings jobType={props.jobType} />

      <form onSubmit={props.onSubmit}>
        <div className="flex justify-between">
          <ButtonLegacy
            onClick={props.onBack}
            type="button"
            className="btn--no-min-w"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <ButtonLegacy
            dataTestId="button-submit"
            type="submit"
            disabled={!(formState.isValid && isValid)}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </div>
  )
}

export default StepConfigure
