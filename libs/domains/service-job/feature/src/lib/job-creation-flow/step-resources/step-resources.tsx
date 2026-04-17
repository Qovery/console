import { useNavigate, useParams } from '@tanstack/react-router'
import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { ApplicationSettingsResources } from '@qovery/domains/services/feature'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, Callout, FunnelFlowBody, Heading, Icon, Section } from '@qovery/shared/ui'
import { useJobCreateContext } from '../job-creation-flow'

export interface StepResourcesContentProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  templateType?: JobLifecycleTypeEnum
}

export function StepResourcesContent({ templateType, onBack, onSubmit }: StepResourcesContentProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <Section>
      <Heading className="mb-2">Resources</Heading>

      <form className="space-y-10" onSubmit={onSubmit}>
        <p className="text-neutral-subtle text-sm">Customize the resources assigned to the service.</p>
        {match(templateType)
          .with('CLOUDFORMATION', 'TERRAFORM', () => (
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                Qovery provides you with a default value for the resources to be used to run this job on your cluster.
                We recommend to test it with these value and customize these later.
              </Callout.Text>
            </Callout.Root>
          ))
          .with('GENERIC', undefined, () => undefined)
          .exhaustive()}
        <ApplicationSettingsResources displayWarningCpu={false} displayInstanceLimits={false} />

        <div className="flex justify-between">
          <Button onClick={onBack} type="button" size="lg" variant="plain">
            Back
          </Button>
          <Button datatest-id="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export function StepResources() {
  const { setCurrentStep, resourcesData, setResourcesData, generalData, jobURL, templateType } = useJobCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/general',
        params: { organizationId, projectId, environmentId },
      })
  }, [generalData, navigate, environmentId, organizationId, jobURL, projectId])

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const methods = useForm<ApplicationResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/variables',
      params: { organizationId, projectId, environmentId },
    })
  })

  const onBack = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/configure',
      params: { organizationId, projectId, environmentId },
    })
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepResourcesContent onBack={onBack} onSubmit={onSubmit} templateType={templateType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}
