import { useParams } from '@tanstack/react-router'
import { type ApplicationEditRequest, type ContainerRequest } from 'qovery-typescript-axios'
import { Suspense, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  ApplicationContainerHealthchecksForm,
  buildHealthchecksPayload,
  defaultLivenessProbe,
  defaultReadinessProbe,
  getProbeType,
  resetHealthchecksFormFromValue,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import { Button, Callout, Icon, Link, LoaderSpinner, Section } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

const HealthchecksSettingsFallback = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

export function ApplicationContainerHealthchecksSettings() {
  return (
    <Suspense fallback={<HealthchecksSettingsFallback />}>
      <ApplicationContainerHealthchecksSettingsContent />
    </Suspense>
  )
}

function ApplicationContainerHealthchecksSettingsContent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const { mutate: editService, isLoading } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<HealthcheckData>({
    mode: 'onChange',
    defaultValues: {
      readiness_probe: {
        current_type: getProbeType(),
        type: {},
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        current_type: getProbeType(),
        type: {},
        ...defaultLivenessProbe,
      },
    },
  })

  useEffect(() => {
    if (service && (service.serviceType === 'APPLICATION' || service.serviceType === 'CONTAINER')) {
      resetHealthchecksFormFromValue(methods, {
        readiness_probe: service.healthchecks?.readiness_probe ?? undefined,
        liveness_probe: service.healthchecks?.liveness_probe ?? undefined,
      })
    }
  }, [methods, service])

  if (!service || (service.serviceType !== 'APPLICATION' && service.serviceType !== 'CONTAINER')) {
    return null
  }

  const defaultPort = service.ports?.[0]?.internal_port

  const onSubmit = methods.handleSubmit((data) => {
    const healthchecks = buildHealthchecksPayload(data, defaultPort).item

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (application) =>
        buildEditServicePayload({
          service: application,
          request: { healthchecks } as ApplicationEditRequest,
        })
      )
      .with({ serviceType: 'CONTAINER' }, (container) =>
        buildEditServicePayload({
          service: container,
          request: { healthchecks } as ContainerRequest,
        })
      )
      .exhaustive()

    editService({
      serviceId: service.id,
      payload,
    })
  })

  return (
    <Section className="px-8 pb-8 pt-6">
      <div className="space-y-6">
        <SettingsHeading
          title="Health checks"
          description="Health checks define how Kubernetes verifies if your service is alive and ready to receive traffic."
        />
        <div className="max-w-content-with-navigation-left space-y-6">
          {'min_running_instances' in service && service.min_running_instances === 1 ? (
            <Callout.Root color="yellow">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text className="text-neutral-subtle">
                If you need higher availability during upgrades, review your{' '}
                <Link
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/resources"
                  params={{ organizationId, projectId, environmentId, serviceId }}
                >
                  resources configuration
                </Link>
                .
              </Callout.Text>
            </Callout.Root>
          ) : null}

          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <ApplicationContainerHealthchecksForm ports={service.ports?.map((port) => port.internal_port) ?? []} />
              <div className="flex justify-end">
                <Button type="submit" size="lg" loading={isLoading}>
                  Save
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Section>
  )
}

export default ApplicationContainerHealthchecksSettings
