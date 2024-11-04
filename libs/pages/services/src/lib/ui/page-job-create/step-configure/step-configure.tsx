import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { JobConfigureSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import { Button, Callout, Heading, Icon, Section } from '@qovery/shared/ui'

export interface StepConfigureProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onBack: () => void
  jobType: JobType
  templateType?: JobLifecycleTypeEnum
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
      <Heading className="mb-2">Triggers</Heading>

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <p className="text-sm text-neutral-350">
          Define the events triggering the execution of this job and the commands to execute.
        </p>

        {match(props.templateType)
          .with('CLOUDFORMATION', 'TERRAFORM', () => (
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                Qovery provides you with a default set of commands to be executed for each environment event based on
                the default Dockerfile. You can customize these based on your needs.
              </Callout.Text>
            </Callout.Root>
          ))
          .with('GENERIC', undefined, () => undefined)
          .exhaustive()}
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
