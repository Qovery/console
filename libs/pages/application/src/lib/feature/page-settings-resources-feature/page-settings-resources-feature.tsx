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
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

type AutoscalingWithKedaFields = {
  mode?: string
  polling_interval_seconds?: number
  cooldown_period_seconds?: number
  scalers?: Array<{
    scaler_type?: string
    enabled?: boolean
    role?: string
    config_json?: Record<string, unknown>
    config_yaml?: string
    trigger_authentication?: {
      name?: string
      config_yaml?: string
    }
  }>
}

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

  const { mutate: editAdvancedSettings } = useEditAdvancedSettings({
    organizationId: environment.organization.id,
    projectId: environment.project.id,
    environmentId: environment.id,
  })

  const { data: advancedSettings } = useAdvancedSettings({
    serviceId: service.id,
    serviceType: service.serviceType,
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

      // Determine autoscaling mode
      autoscaling_mode: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          // If KEDA autoscaling policy exists, it's KEDA
          if (s.autoscaling?.mode === 'KEDA') return 'KEDA'
          // If min === max, it's fixed instances (NONE mode)
          if (s.min_running_instances === s.max_running_instances) return 'NONE'
          // If min !== max and no KEDA, backend considers it as HPA
          if (s.min_running_instances !== s.max_running_instances) return 'HPA'
          // Default to NONE
          return 'NONE'
        })
        .otherwise(() => 'NONE'),

      // HPA fields
      hpa_metric_type: (() => {
        const settings = advancedSettings as Record<string, any> | undefined
        const hpaMemoryValue = settings?.['hpa.memory.average_utilization_percent']

        if (hpaMemoryValue != null) {
          return 'CPU_AND_MEMORY'
        }
        return 'CPU'
      })(),
      hpa_cpu_average_utilization_percent: (() => {
        const settings = advancedSettings as Record<string, any> | undefined
        const hpaCpuValue = settings?.['hpa.cpu.average_utilization_percent']

        if (hpaCpuValue != null) {
          return hpaCpuValue as number
        }
        return 60
      })(),
      hpa_memory_average_utilization_percent: (() => {
        const settings = advancedSettings as Record<string, any> | undefined
        const hpaMemoryValue = settings?.['hpa.memory.average_utilization_percent']

        if (hpaMemoryValue != null) {
          return hpaMemoryValue as number
        }
        return 60
      })(),

      // KEDA fields
      autoscaling_enabled: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => s.autoscaling?.mode === 'KEDA')
        .otherwise(() => false),
      scalers: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          if (!s.autoscaling) return []
          const autoscalingWithFields = s.autoscaling as AutoscalingWithKedaFields
          return (
            autoscalingWithFields.scalers?.map((scaler) => ({
              type: scaler.scaler_type || '',
              config: scaler.config_yaml || '',
              triggerAuthentication: scaler.trigger_authentication?.config_yaml || '',
            })) || []
          )
        })
        .otherwise(() => []),
      autoscaling_polling_interval: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          const autoscalingWithFields = s.autoscaling as AutoscalingWithKedaFields | undefined
          return autoscalingWithFields?.polling_interval_seconds ?? 30
        })
        .otherwise(() => 30),
      autoscaling_cooldown_period: match(service)
        .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
          const autoscalingWithFields = s.autoscaling as AutoscalingWithKedaFields | undefined
          return autoscalingWithFields?.cooldown_period_seconds ?? 300
        })
        .otherwise(() => 300),
      ...defaultInstances,
    },
  })

  // Update form values when advanced settings are loaded
  useEffect(() => {
    if (advancedSettings) {
      const settings = advancedSettings as Record<string, any>
      const hpaMemoryValue = settings['hpa.memory.average_utilization_percent']
      const hpaCpuValue = settings['hpa.cpu.average_utilization_percent']

      if (hpaMemoryValue != null) {
        methods.setValue('hpa_metric_type', 'CPU_AND_MEMORY', { shouldDirty: false })
        methods.setValue('hpa_memory_average_utilization_percent', hpaMemoryValue as number, { shouldDirty: false })
        methods.setValue('hpa_cpu_average_utilization_percent', (hpaCpuValue as number) ?? 60, { shouldDirty: false })
      } else if (hpaCpuValue != null) {
        methods.setValue('hpa_metric_type', 'CPU', { shouldDirty: false })
        methods.setValue('hpa_cpu_average_utilization_percent', hpaCpuValue as number, { shouldDirty: false })
        methods.setValue('hpa_memory_average_utilization_percent', 60, { shouldDirty: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedSettings])

  const onSubmit = methods.handleSubmit(async (data: FieldValues) => {
    const request = {
      memory: Number(data['memory']),
      cpu: Number(data['cpu']),
      gpu: Number(data['gpu']),
    }

    let requestWithInstances = {}
    if (service.serviceType !== 'JOB') {
      const autoscalingMode = data['autoscaling_mode'] || 'NONE'

      switch (autoscalingMode) {
        case 'NONE':
          // Fixed instances: min = max, no autoscaling
          requestWithInstances = {
            ...request,
            min_running_instances: data['min_running_instances'],
            max_running_instances: data['min_running_instances'], // Force max = min
            scalers: null,
            autoscaling_polling_interval: null,
            autoscaling_cooldown_period: null,
            autoscaling_mode: 'NONE',
            hpa_metric_type: undefined,
            hpa_cpu_average_utilization_percent: undefined,
            hpa_memory_average_utilization_percent: undefined,
          }
          break

        case 'HPA': {
          // HPA mode: min !== max, HPA autoscaling
          const metricChoice = data['hpa_metric_type'] === 'CPU_AND_MEMORY' ? 'CPU_AND_MEMORY' : 'CPU'
          const cpuAverageUtilization = Number(data['hpa_cpu_average_utilization_percent']) || 60

          requestWithInstances = {
            ...request,
            min_running_instances: data['min_running_instances'],
            max_running_instances: data['max_running_instances'],
            scalers: null,
            autoscaling_polling_interval: null,
            autoscaling_cooldown_period: null,
            autoscaling_mode: 'HPA',
            hpa_metric_type: 'CPU',
            hpa_cpu_average_utilization_percent: cpuAverageUtilization,
            hpa_memory_average_utilization_percent:
              metricChoice === 'CPU_AND_MEMORY'
                ? Number(data['hpa_memory_average_utilization_percent']) || 60
                : undefined,
          }
          break
        }

        case 'KEDA': {
          // KEDA mode: include trigger authentication directly in scaler payload
          const scalersWithAuth = (data['scalers'] || []).map((scaler: any) => {
            const baseScaler = {
              type: scaler.type,
              config: scaler.config,
            }

            // If scaler has triggerAuthentication YAML, include it inline
            if (scaler.triggerAuthentication && scaler.triggerAuthentication.trim() !== '') {
              return {
                ...baseScaler,
                trigger_authentication: {
                  config_yaml: scaler.triggerAuthentication,
                },
              }
            }

            // No trigger authentication needed
            return baseScaler
          })

          requestWithInstances = {
            ...request,
            min_running_instances: data['min_running_instances'],
            max_running_instances: data['max_running_instances'],
            scalers: scalersWithAuth,
            autoscaling_polling_interval: data['autoscaling_polling_interval']
              ? Number(data['autoscaling_polling_interval'])
              : undefined,
            autoscaling_cooldown_period: data['autoscaling_cooldown_period']
              ? Number(data['autoscaling_cooldown_period'])
              : undefined,
            autoscaling_mode: 'KEDA',
            hpa_metric_type: undefined,
            hpa_cpu_average_utilization_percent: undefined,
            hpa_memory_average_utilization_percent: undefined,
          }
          break
        }
      }
    }

    const payload = match(service)
      .with({ serviceType: 'JOB' }, (service) => buildEditServicePayload({ service, request }))
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

    // Save service resources
    editService(
      {
        serviceId: service.id,
        payload,
      },
      {
        onSuccess: () => {
          // If HPA mode, also save advanced settings
          const autoscalingMode = data['autoscaling_mode']
          if (autoscalingMode === 'HPA') {
            const metricChoice = data['hpa_metric_type'] === 'CPU_AND_MEMORY' ? 'CPU_AND_MEMORY' : 'CPU'
            const cpuAverageUtilizationPercent = Number(data['hpa_cpu_average_utilization_percent']) || 60
            const memoryAverageUtilizationPercent = Number(data['hpa_memory_average_utilization_percent']) || 60

            const advancedPayload = {
              serviceType: service.serviceType,
              'hpa.cpu.average_utilization_percent': cpuAverageUtilizationPercent,
              'hpa.memory.average_utilization_percent':
                metricChoice === 'CPU_AND_MEMORY' ? memoryAverageUtilizationPercent : null,
            }

            editAdvancedSettings({
              serviceId: service.id,
              payload: advancedPayload as any,
            })
          }
        },
      }
    )
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
