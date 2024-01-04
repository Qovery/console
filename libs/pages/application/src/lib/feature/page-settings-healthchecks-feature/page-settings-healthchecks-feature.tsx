import { type Probe, type ProbeType } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  type Application,
  type ApplicationType,
  type Container,
  type ContainerType,
  type Job,
  type JobType,
  type ServiceType,
} from '@qovery/domains/services/data-access'
import { useEditService, useService, useServiceType } from '@qovery/domains/services/feature'
import { defaultLivenessProbe, defaultReadinessProbe, probeFormatted } from '@qovery/shared/console-shared'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import { APPLICATION_SETTINGS_RESOURCES_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsHealthchecks from '../../ui/page-settings-healthchecks/page-settings-healthchecks'

export function SettingsHealthchecksFeature({
  serviceType,
}: {
  serviceType: Extract<ServiceType, ApplicationType | ContainerType | JobType>
}) {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ serviceId: applicationId, serviceType })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({ environmentId })

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      readiness_probe: {
        ...{
          type: {
            [ProbeTypeEnum.NONE.toLowerCase()]: null,
          },
        },
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        ...{
          type: {
            [ProbeTypeEnum.NONE.toLowerCase()]: null,
          },
        },
        ...defaultLivenessProbe,
      },
    } as HealthcheckData,
  })

  const onSubmit = methods.handleSubmit((data: FieldValues) => {
    if (!service) return

    const defaultPort = match(service)
      .with({ serviceType: 'JOB' }, (s) => s.port)
      .otherwise((s) => s?.ports?.[0]?.internal_port)

    const healthchecks = {
      readiness_probe:
        ProbeTypeEnum.NONE !== data['readiness_probe']['current_type']
          ? probeFormatted(data['readiness_probe'], defaultPort)
          : undefined,
      liveness_probe:
        ProbeTypeEnum.NONE !== data['liveness_probe']['current_type']
          ? probeFormatted(data['liveness_probe'], defaultPort)
          : undefined,
    }

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (s) => buildEditServicePayload({ service: s, request: { healthchecks } }))
      .with({ serviceType: 'JOB' }, (s) => buildEditServicePayload({ service: s, request: { healthchecks } }))
      .with({ serviceType: 'CONTAINER' }, (s) => buildEditServicePayload({ service: s, request: { healthchecks } }))
      .exhaustive()

    editService({
      serviceId: applicationId,
      payload,
    })
  })

  // Use memo to get the TYPE of readiness probe
  const defaultTypeReadiness = useMemo(() => {
    const types = service?.healthchecks?.readiness_probe?.type as ProbeType
    const readinessProbeKeys = Object.keys(types || {})
    const nonNullKeyReadiness = readinessProbeKeys.find((key) => (types as { [key: string]: unknown })[key] !== null)
    return nonNullKeyReadiness?.toUpperCase() || ProbeTypeEnum.NONE
  }, [service?.healthchecks?.readiness_probe])

  // Use memo to get the TYPE of liveness probe
  const defaultTypeLiveness = useMemo(() => {
    const types = service?.healthchecks?.liveness_probe?.type as ProbeType
    const livenessProbeKeys = Object.keys(types || {})
    const nonNullKeyLiveness = livenessProbeKeys.find((key) => (types as { [key: string]: unknown })[key] !== null)
    return nonNullKeyLiveness?.toUpperCase() || ProbeTypeEnum.NONE
  }, [service?.healthchecks?.liveness_probe])

  useEffect(() => {
    const setProbeValues = (probeName: string, values: Probe) => {
      Object.entries(values).forEach(([field, value]) => {
        const probePath = `${probeName}.${field}`
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          setProbeValues(probePath, value)
        } else {
          // TODO: need to find a better way to set the value and remove the any
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          methods.setValue(probePath as any, Array.isArray(value) ? JSON.stringify(value) : value)
        }
      })
    }

    methods.setValue('readiness_probe.current_type', defaultTypeReadiness)
    methods.setValue('liveness_probe.current_type', defaultTypeLiveness)

    if (service?.healthchecks?.readiness_probe) {
      setProbeValues('readiness_probe', service?.healthchecks?.readiness_probe)
    }

    if (service?.healthchecks?.liveness_probe) {
      setProbeValues('liveness_probe', service?.healthchecks?.liveness_probe)
    }
  }, [
    methods,
    service?.healthchecks?.liveness_probe,
    service?.healthchecks?.readiness_probe,
    defaultTypeReadiness,
    defaultTypeLiveness,
  ])

  if (!service) return null

  return (
    <FormProvider {...methods}>
      <PageSettingsHealthchecks
        ports={(service as Application | Container).ports}
        jobPort={(service as Job).port}
        isJob={service.serviceType === 'JOB'}
        minRunningInstances={(service as Application | Container)?.min_running_instances}
        linkResourcesSetting={`${APPLICATION_URL(
          organizationId,
          projectId,
          environmentId,
          applicationId
        )}${APPLICATION_SETTINGS_URL}${APPLICATION_SETTINGS_RESOURCES_URL}`}
        onSubmit={onSubmit}
        loading={isLoadingEditService}
        environmentMode={environment?.mode}
      />
    </FormProvider>
  )
}

export function PageSettingsAdvancedFeature() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: serviceType } = useServiceType({ environmentId, serviceId: applicationId })

  if (serviceType !== ('APPLICATION' || 'CONTAINER' || 'JOB')) {
    return undefined
  }

  return <SettingsHealthchecksFeature serviceType={serviceType} />
}

export default PageSettingsAdvancedFeature
