import { type FormEventHandler, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { JobConfigureSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import { Button, Heading, Section } from '@qovery/shared/ui'

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
    <Section>
      <Heading className="mb-2">Job configuration</Heading>

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <p className="text-sm text-neutral-350">Job configuration allows you to control the behaviour of your job</p>

        <JobConfigureSettings jobType={props.jobType} />

        <div className="flex justify-between">
          <Button onClick={props.onBack} type="button" size="lg" variant="plain">
            Back
          </Button>
          <Button data-testid="button-submit" type="submit" disabled={!(formState.isValid && isValid)} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepConfigure
