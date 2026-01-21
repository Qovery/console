import { type Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import {
  useAdvancedSettings,
  useEditAdvancedSettings,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import {
  buildAutoscalingRequestFromForm,
  buildEditServicePayload,
  buildHpaAdvancedSettingsPayload,
  loadHpaSettingsFromAdvancedSettings,
} from '@qovery/shared/util-services'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export interface SettingsResourcesFeatureProps {
  service: Exclude<AnyService, Helm | Database>
  environment: Environment
}

export function SettingsResourcesFeature({ service, environment }: SettingsResourcesFeatureProps) {
  const { mutate: editService, isLoading: isLoadingService } = useEditService({
    organizationId: environment.organization.id,
    projectId: environment.project.id,
    environmentId: environment.id,
  })

  const { data: advancedSettings } = useAdvancedSettings({ serviceId: service.id, serviceType: service.serviceType })
  const { mutateAsync: editAdvancedSettings } = useEditAdvancedSettings({
    organizationId: environment.organization.id,
    projectId: environment.project.id,
    environmentId: environment.id,
  })

  const defaultInstances = match(service)
    .with({ serviceType: 'JOB' }, () => ({}))
    .with({ serviceType: 'TERRAFORM' }, (s) => ({
      storage_gib: s.job_resources.storage_gib,
    }))
    .otherwise((s) => ({
      min_running_instances: s.min_running_instances || 1,
      max_running_instances: s.max_running_instances || 1,
    }))

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: match(service)
        .with({ serviceType: 'TERRAFORM' }, (s) => s.job_resources.ram_mib)
        .otherwise((s) => s.memory || 0),
      cpu: match(service)
        .with({ serviceType: 'TERRAFORM' }, (s) => s.job_resources.cpu_milli)
        .otherwise((s) => s.cpu || 0),
      gpu: match(service)
        .with({ serviceType: 'TERRAFORM' }, (s) => s.job_resources.gpu)
        .otherwise((s) => s.gpu || 0),

      autoscaling_mode: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          if (s.autoscaling?.mode === 'KEDA') return 'KEDA'
          if (s.min_running_instances === s.max_running_instances) return 'NONE'
          if (s.min_running_instances !== s.max_running_instances) return 'HPA'
          return 'NONE'
        })
        .otherwise(() => 'NONE'),

      scalers: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          if (s.autoscaling?.mode !== 'KEDA') return []
          const autoscalingWithFields = s.autoscaling as {
            scalers?: Array<{
              scaler_type?: string
              config_yaml?: string
              trigger_authentication?: { config_yaml?: string }
            }>
          }
          return (
            autoscalingWithFields.scalers?.map((scaler) => ({
              type: scaler?.scaler_type || '',
              config: scaler?.config_yaml || '',
              triggerAuthentication: scaler?.trigger_authentication?.config_yaml || '',
            })) || []
          )
        })
        .otherwise(() => []),

      autoscaling_polling_interval: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          if (s.autoscaling?.mode !== 'KEDA') return undefined
          const autoscalingWithFields = s.autoscaling as { polling_interval_seconds?: number } | undefined
          return autoscalingWithFields?.polling_interval_seconds
        })
        .otherwise(() => undefined),

      autoscaling_cooldown_period: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          if (s.autoscaling?.mode !== 'KEDA') return undefined
          const autoscalingWithFields = s.autoscaling as { cooldown_period_seconds?: number } | undefined
          return autoscalingWithFields?.cooldown_period_seconds
        })
        .otherwise(() => undefined),

      ...loadHpaSettingsFromAdvancedSettings(advancedSettings),

      ...defaultInstances,
    },
  })

  // Update form values when advanced settings change (e.g., after save)
  useEffect(() => {
    if (advancedSettings) {
      const hpaSettings = loadHpaSettingsFromAdvancedSettings(advancedSettings)
      methods.setValue('hpa_metric_type', hpaSettings.hpa_metric_type)
      methods.setValue('hpa_cpu_average_utilization_percent', hpaSettings.hpa_cpu_average_utilization_percent)
      methods.setValue('hpa_memory_average_utilization_percent', hpaSettings.hpa_memory_average_utilization_percent)
    }
  }, [advancedSettings, methods])

  const onSubmit = methods.handleSubmit(async (data: FieldValues) => {
    const baseRequest = {
      memory: Number(data['memory']),
      cpu: Number(data['cpu']),
      gpu: Number(data['gpu']),
    }

    const requestWithInstances =
      service.serviceType !== 'JOB' ? buildAutoscalingRequestFromForm(data, baseRequest) : baseRequest

    const payload = match(service)
      .with({ serviceType: 'JOB' }, (service) => buildEditServicePayload({ service, request: baseRequest }))
      .with({ serviceType: 'APPLICATION' }, (service) =>
        buildEditServicePayload({
          service,
          request: requestWithInstances,
        })
      )
      .with({ serviceType: 'CONTAINER' }, (service) =>
        buildEditServicePayload({
          service,
          request: requestWithInstances,
        })
      )
      .with({ serviceType: 'TERRAFORM' }, (service) =>
        buildEditServicePayload({
          service,
          request: {
            job_resources: {
              cpu_milli: Number(data['cpu']),
              ram_mib: Number(data['memory']),
              storage_gib: Number(data['storage_gib']),
              gpu: Number(data['gpu']),
            },
          },
        })
      )
      .exhaustive()

    // Save HPA advanced settings if in HPA mode
    if (data['autoscaling_mode'] === 'HPA' && advancedSettings) {
      await editAdvancedSettings({
        serviceId: service.id,
        payload: {
          serviceType: service.serviceType,
          ...buildHpaAdvancedSettingsPayload(data, advancedSettings),
        },
      })
    }

    editService({
      serviceId: service.id,
      payload,
    })
  })

  const displayWarningCpu: boolean =
    'maximum_cpu' in service && (methods.watch('cpu') || 0) > (service.maximum_cpu || 0)

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={isLoadingService}
        service={service}
        displayWarningCpu={displayWarningCpu}
        advancedSettings={advancedSettings}
      />
    </FormProvider>
  )
}

export function PageSettingsResourcesFeature() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  if (!environment) return null

  return match(service)
    .with(
      { serviceType: 'APPLICATION' },
      { serviceType: 'CONTAINER' },
      { serviceType: 'JOB' },
      { serviceType: 'TERRAFORM' },
      (service) => <SettingsResourcesFeature service={service} environment={environment} />
    )
    .otherwise(() => null)
}

export default PageSettingsResourcesFeature
