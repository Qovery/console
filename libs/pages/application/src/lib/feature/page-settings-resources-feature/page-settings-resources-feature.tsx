import { useQueryClient } from '@tanstack/react-query'
import { type Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  useCreateKedaTriggerAuthentication,
  useUpdateKedaTriggerAuthentication,
} from '@qovery/domains/organizations/feature'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import {
  useAdvancedSettings,
  useEditAdvancedSettings,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { sanitizeKubernetesName } from '@qovery/shared/util-js'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { queries } from '@qovery/state/util-queries'
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
    trigger_authentication_id?: string
  }>
}

export interface SettingsResourcesFeatureProps {
  service: Exclude<AnyService, Helm | Database>
  environment: Environment
}

export function SettingsResourcesFeature({ service, environment }: SettingsResourcesFeatureProps) {
  const queryClient = useQueryClient()

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

  const { mutateAsync: createKedaTriggerAuth } = useCreateKedaTriggerAuthentication()
  const { mutateAsync: updateKedaTriggerAuth } = useUpdateKedaTriggerAuthentication()

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
        // Check if hpa.memory exists in advanced settings (flattened keys)
        const settings = advancedSettings as Record<string, any> | undefined
        const hpaMemoryValue = settings?.['hpa.memory.average_utilization_percent']

        if (hpaMemoryValue != null) {
          return 'MEMORY'
        }
        return 'CPU'
      })(),
      hpa_average_utilization_percent: (() => {
        // Get the value from advanced settings based on the metric type
        const settings = advancedSettings as Record<string, any> | undefined
        const hpaMemoryValue = settings?.['hpa.memory.average_utilization_percent']
        const hpaCpuValue = settings?.['hpa.cpu.average_utilization_percent']

        // If memory is set, use memory value
        if (hpaMemoryValue != null) {
          return hpaMemoryValue as number
        }
        // Otherwise use CPU value if available
        if (hpaCpuValue != null) {
          return hpaCpuValue as number
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
              triggerAuthentication: '', // Will be loaded later from API if trigger_authentication_id exists
              trigger_authentication_id: scaler.trigger_authentication_id,
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
      // Check for flattened keys
      const settings = advancedSettings as Record<string, any>
      const hpaMemoryValue = settings['hpa.memory.average_utilization_percent']
      const hpaCpuValue = settings['hpa.cpu.average_utilization_percent']

      // If memory is set, update metric type to MEMORY
      if (hpaMemoryValue != null) {
        methods.setValue('hpa_metric_type', 'MEMORY', { shouldDirty: false })
        methods.setValue('hpa_average_utilization_percent', hpaMemoryValue as number, { shouldDirty: false })
      }
      // Otherwise if CPU is set, use CPU value
      else if (hpaCpuValue != null) {
        methods.setValue('hpa_metric_type', 'CPU', { shouldDirty: false })
        methods.setValue('hpa_average_utilization_percent', hpaCpuValue as number, { shouldDirty: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedSettings])

  // Load trigger authentications for existing scalers
  useEffect(() => {
    const loadTriggerAuthentications = async () => {
      const scalers = methods.getValues('scalers') as Array<{
        type: string
        config: string
        triggerAuthentication?: string
        trigger_authentication_id?: string
      }>

      if (!scalers || scalers.length === 0) return

      const updatedScalers = await Promise.all(
        scalers.map(async (scaler) => {
          // If scaler has trigger_authentication_id but no triggerAuthentication YAML, load it
          if (
            scaler.trigger_authentication_id &&
            (!scaler.triggerAuthentication || scaler.triggerAuthentication === '')
          ) {
            try {
              const triggerAuth = await queryClient.fetchQuery(
                queries.organizations.kedaTriggerAuthentication({
                  organizationId: environment.organization.id,
                  triggerAuthenticationId: scaler.trigger_authentication_id,
                })
              )
              if (triggerAuth) {
                return {
                  ...scaler,
                  triggerAuthentication: triggerAuth.config_yaml || '',
                }
              }
            } catch (error) {
              console.error('Failed to load trigger authentication:', error)
            }
          }
          // Ensure triggerAuthentication is always defined (at least empty string)
          return {
            ...scaler,
            triggerAuthentication: scaler.triggerAuthentication || '',
          }
        })
      )

      // Update the form with loaded trigger authentications
      methods.setValue('scalers', updatedScalers as any, { shouldDirty: false })
    }

    loadTriggerAuthentications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.id])

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
            hpa_average_utilization_percent: undefined,
          }
          break

        case 'HPA':
          // HPA mode: min !== max, HPA autoscaling
          requestWithInstances = {
            ...request,
            min_running_instances: data['min_running_instances'],
            max_running_instances: data['max_running_instances'],
            scalers: null,
            autoscaling_polling_interval: null,
            autoscaling_cooldown_period: null,
            autoscaling_mode: 'HPA',
            hpa_metric_type: data['hpa_metric_type'] || 'CPU',
            hpa_average_utilization_percent: Number(data['hpa_average_utilization_percent']) || 60,
          }
          break

        case 'KEDA': {
          // KEDA mode: create trigger authentications for scalers that need them
          const scalersWithAuth = await Promise.all(
            (data['scalers'] || []).map(async (scaler: any, index: number) => {
              // If scaler has triggerAuthentication YAML and no existing ID, create new
              if (
                scaler.triggerAuthentication &&
                scaler.triggerAuthentication.trim() !== '' &&
                !scaler.trigger_authentication_id
              ) {
                try {
                  const sanitizedServiceName = sanitizeKubernetesName(service.name)
                  const triggerAuth = await createKedaTriggerAuth({
                    organizationId: environment.organization.id,
                    kedaTriggerAuthenticationRequest: {
                      name: `${sanitizedServiceName}-scaler-${index + 1}-trigger-auth`,
                      config_yaml: scaler.triggerAuthentication,
                    },
                  })

                  return {
                    type: scaler.type,
                    config: scaler.config,
                    trigger_authentication_id: triggerAuth.id,
                  }
                } catch (error) {
                  console.error('Failed to create trigger authentication:', error)
                  return {
                    type: scaler.type,
                    config: scaler.config,
                  }
                }
              }

              // If scaler already has trigger_authentication_id and YAML, update it
              if (
                scaler.trigger_authentication_id &&
                scaler.triggerAuthentication &&
                scaler.triggerAuthentication.trim() !== ''
              ) {
                try {
                  const sanitizedServiceName = sanitizeKubernetesName(service.name)
                  await updateKedaTriggerAuth({
                    organizationId: environment.organization.id,
                    triggerAuthenticationId: scaler.trigger_authentication_id,
                    kedaTriggerAuthenticationRequest: {
                      name: `${sanitizedServiceName}-scaler-${index + 1}-trigger-auth`,
                      config_yaml: scaler.triggerAuthentication,
                    },
                  })

                  return {
                    type: scaler.type,
                    config: scaler.config,
                    trigger_authentication_id: scaler.trigger_authentication_id,
                  }
                } catch (error) {
                  console.error('Failed to update trigger authentication:', error)
                  return {
                    type: scaler.type,
                    config: scaler.config,
                    trigger_authentication_id: scaler.trigger_authentication_id,
                  }
                }
              }

              // If scaler already has trigger_authentication_id but no YAML, keep it as is
              if (scaler.trigger_authentication_id) {
                return {
                  type: scaler.type,
                  config: scaler.config,
                  trigger_authentication_id: scaler.trigger_authentication_id,
                }
              }

              // No trigger authentication needed
              return {
                type: scaler.type,
                config: scaler.config,
              }
            })
          )

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
            hpa_average_utilization_percent: undefined,
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
            const hpaMetricType = data['hpa_metric_type'] || 'CPU'
            const hpaAverageUtilizationPercent = Number(data['hpa_average_utilization_percent']) || 60

            // Build advanced settings key based on metric type
            const advancedSettingsKey =
              hpaMetricType === 'CPU' ? 'hpa.cpu.average_utilization_percent' : 'hpa.memory.average_utilization_percent'

            editAdvancedSettings({
              serviceId: service.id,
              payload: {
                serviceType: service.serviceType,
                [advancedSettingsKey]: hpaAverageUtilizationPercent,
              },
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
