import { useParams } from '@tanstack/react-router'
import { type FormEventHandler, useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, Link, Section } from '@qovery/shared/ui'
import { ApplicationSettingsResources } from '../../application-settings-resources/application-settings-resources'
import { useApplicationContainerCreateContext } from './application-container-creation-flow'

export interface ApplicationContainerStepResourcesProps {
  onSubmit: (data: ApplicationResourcesData) => void
}

export function ApplicationContainerStepResources({ onSubmit }: ApplicationContainerStepResourcesProps) {
  const { resourcesForm, setCurrentStep } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '', slug } = useParams({ strict: false })

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const methods = resourcesForm

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit((data) => {
    onSubmit(data)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Section className="space-y-10">
            <div className="flex flex-col gap-2">
              <Heading>Resources</Heading>
              <p className="text-sm text-neutral-subtle">Customize the resources assigned to the service.</p>
            </div>

            <ApplicationSettingsResources displayWarningCpu={false} />

            <div className="flex items-center justify-between">
              <Link
                as="button"
                size="lg"
                type="button"
                variant="plain"
                color="neutral"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/general"
                params={{
                  organizationId,
                  projectId,
                  environmentId,
                  slug,
                }}
              >
                Back
              </Link>

              <Button type="submit" disabled={!methods.formState.isValid} size="lg">
                Continue
              </Button>
            </div>
          </Section>
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default ApplicationContainerStepResources
