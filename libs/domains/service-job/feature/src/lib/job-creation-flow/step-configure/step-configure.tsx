import { useNavigate, useParams } from '@tanstack/react-router'
import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import { Button, Callout, FunnelFlowBody, Heading, Icon, Section } from '@qovery/shared/ui'
import { parseCmd } from '@qovery/shared/util-js'
import { JobConfigurationForm } from '../../job-configuration-form/job-configuration-form'
import { useJobCreateContext } from '../job-creation-flow'

export interface StepConfigureProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onBack: () => void
  jobType: JobType
  templateType?: JobLifecycleTypeEnum
}

export function StepConfigure() {
  const {
    configureData,
    setConfigureData,
    setCurrentStep,
    generalData,
    dockerfileForm,
    jobURL,
    jobType,
    templateType,
  } = useJobCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate({
        to: jobURL + '/general',
        params: { organizationId, projectId, environmentId },
      })
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL])

  useEffect(() => {
    setCurrentStep(3)

    if (configureData?.nb_restarts === undefined) {
      methods.setValue('nb_restarts', 0)
    }

    if (configureData?.max_duration === undefined) {
      methods.setValue('max_duration', 300)
    }
  }, [setCurrentStep])

  const methods = useForm<JobConfigureData>({
    defaultValues: configureData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData: JobConfigureData = {
      ...data,
    }

    if (jobType === ServiceTypeEnum.LIFECYCLE_JOB) {
      if (cloneData.on_start?.enabled && cloneData.on_start?.arguments_string) {
        cloneData.on_start.arguments = parseCmd(cloneData.on_start.arguments_string)
      }

      if (cloneData.on_stop?.enabled && cloneData.on_stop?.arguments_string) {
        cloneData.on_stop.arguments = parseCmd(cloneData.on_stop.arguments_string)
      }

      if (cloneData.on_delete?.enabled && cloneData.on_delete?.arguments_string) {
        cloneData.on_delete.arguments = parseCmd(cloneData.on_delete.arguments_string)
      }
    }

    setConfigureData(cloneData)
    navigate({
      to: jobURL + '/resources',
      params: { organizationId, projectId, environmentId },
    })
  })

  const onBack = () => {
    if (
      (dockerfileForm.getValues('dockerfile_path') || dockerfileForm.getValues('dockerfile_raw')) &&
      jobType !== 'CRON_JOB'
    ) {
      navigate({
        to: jobURL + '/dockerfile',
        params: { organizationId, projectId, environmentId },
      })
    } else {
      navigate({
        to: jobURL + '/general',
        params: { organizationId, projectId, environmentId },
      })
    }
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepConfigureContent onSubmit={onSubmit} onBack={onBack} jobType={jobType} templateType={templateType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

function StepConfigureContent(props: StepConfigureProps) {
  const { formState, watch } = useFormContext<JobConfigureData>()
  const [isValid, setIsValid] = useState(true)

  watch((data) => {
    if (props.jobType === ServiceTypeEnum.LIFECYCLE_JOB) {
      setIsValid(Boolean(data.on_start?.enabled || data.on_stop?.enabled || data.on_delete?.enabled))
    }
  })

  return (
    <Section>
      <Heading className="mb-2">
        {props.jobType === ServiceTypeEnum.CRON_JOB ? 'Job configuration' : 'Triggers'}
      </Heading>

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <p className="text-sm text-neutral-subtle">
          {props.jobType === ServiceTypeEnum.CRON_JOB
            ? 'Job configuration allows you to control the behavior of your service.'
            : 'Define the events triggering the execution of this job and the commands to execute.'}
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
        <JobConfigurationForm jobType={props.jobType} />
        {/*<JobConfigureSettings jobType={props.jobType} />*/}

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
