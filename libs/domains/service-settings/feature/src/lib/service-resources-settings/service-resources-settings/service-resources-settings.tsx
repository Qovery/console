// This component intentionally handles all non-database service types together
// (APPLICATION, CONTAINER, JOB, TERRAFORM).
// We avoid splitting by service type here because they share the same resources form
// and submit logic (autoscaling/HPA/KEDA + payload).
// DATABASE stays separate because its resources UX and managed flow are different.
import { useParams } from '@tanstack/react-router'
import { type FormEventHandler, useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import {
  ApplicationSettingsResources,
  useAdvancedSettings,
  useEditAdvancedSettings,
  useEditService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, Section } from '@qovery/shared/ui'
import {
  buildAutoscalingRequestFromForm,
  buildEditServicePayload,
  buildHpaAdvancedSettingsPayload,
  loadHpaSettingsFromAdvancedSettings,
} from '@qovery/shared/util-services'

type ServiceResourcesService = Exclude<AnyService, Database | Helm>

interface ServiceResourcesFormData extends ApplicationResourcesData {
  storage_gib?: number
}

export interface ServiceResourcesSettingsProps {
  service: ServiceResourcesService
}

interface ServiceResourcesSettingsFormProps {
  service: ServiceResourcesService
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
  displayWarningCpu: boolean
  advancedSettings?: unknown
}

function getDefaultValues(
  service: ServiceResourcesService,
  advancedSettings?: unknown
): Partial<ServiceResourcesFormData> {
  const autoscalingMode: ServiceResourcesFormData['autoscaling_mode'] = match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (resourceService) => {
      if (resourceService.autoscaling?.mode === 'KEDA') return 'KEDA' as const
      if (resourceService.min_running_instances === resourceService.max_running_instances) return 'NONE' as const
      if (resourceService.min_running_instances !== resourceService.max_running_instances) return 'HPA' as const
      return 'NONE' as const
    })
    .otherwise(() => 'NONE' as const)

  const defaultInstances = match(service)
    .with({ serviceType: 'JOB' }, () => ({}))
    .with({ serviceType: 'TERRAFORM' }, (terraform) => ({
      storage_gib: terraform.job_resources.storage_gib,
    }))
    .otherwise((resourceService) => ({
      min_running_instances: resourceService.min_running_instances ?? 1,
      max_running_instances: resourceService.max_running_instances ?? 1,
    }))

  return {
    memory: match(service)
      .with({ serviceType: 'TERRAFORM' }, (terraform) => terraform.job_resources.ram_mib)
      .otherwise((resourceService) => resourceService.memory || 0),
    cpu: match(service)
      .with({ serviceType: 'TERRAFORM' }, (terraform) => terraform.job_resources.cpu_milli)
      .otherwise((resourceService) => resourceService.cpu || 0),
    gpu: match(service)
      .with({ serviceType: 'TERRAFORM' }, (terraform) => terraform.job_resources.gpu)
      .otherwise((resourceService) => resourceService.gpu || 0),
    autoscaling_mode: autoscalingMode,
    scalers: match(service)
      .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (resourceService) => {
        if (resourceService.autoscaling?.mode !== 'KEDA') return []

        const autoscalingWithFields = resourceService.autoscaling as {
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
      .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (resourceService) => {
        if (resourceService.autoscaling?.mode !== 'KEDA') return undefined
        const autoscalingWithFields = resourceService.autoscaling as { polling_interval_seconds?: number } | undefined
        return autoscalingWithFields?.polling_interval_seconds
      })
      .otherwise(() => undefined),
    autoscaling_cooldown_period: match(service)
      .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (resourceService) => {
        if (resourceService.autoscaling?.mode !== 'KEDA') return undefined
        const autoscalingWithFields = resourceService.autoscaling as { cooldown_period_seconds?: number } | undefined
        return autoscalingWithFields?.cooldown_period_seconds
      })
      .otherwise(() => undefined),
    ...loadHpaSettingsFromAdvancedSettings(advancedSettings),
    ...defaultInstances,
  }
}

function ServiceResourcesSettingsForm({
  service,
  onSubmit,
  loading,
  displayWarningCpu,
  advancedSettings,
}: ServiceResourcesSettingsFormProps) {
  const { formState, watch } = useFormContext<ServiceResourcesFormData>()
  const autoscalingMode = watch('autoscaling_mode') || 'NONE'

  const currentAutoscalingMode = match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (resourceService) => {
      if (resourceService.autoscaling?.mode === 'KEDA') return 'KEDA'
      if (resourceService.min_running_instances === resourceService.max_running_instances) return 'NONE'
      if (resourceService.min_running_instances !== resourceService.max_running_instances) return 'HPA'
      return 'NONE'
    })
    .otherwise(() => 'NONE')

  const isHpaToKedaMigration = currentAutoscalingMode === 'HPA' && autoscalingMode === 'KEDA'

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading title="Resources" description="Manage the resources assigned to the service." />
        <div className="max-w-content-with-navigation-left">
          <form className="space-y-10" onSubmit={onSubmit}>
            <ApplicationSettingsResources
              displayWarningCpu={displayWarningCpu}
              service={service}
              advancedSettings={advancedSettings}
            />
            <div className="flex justify-end">
              <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid || isHpaToKedaMigration}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </div>
  )
}

export function ServiceResourcesSettings({ service }: ServiceResourcesSettingsProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })

  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const { data: advancedSettings } = useAdvancedSettings({
    serviceId: service.id,
    serviceType: service.serviceType,
    suspense: true,
  })

  const { mutateAsync: editAdvancedSettings, isLoading: isLoadingEditAdvancedSettings } = useEditAdvancedSettings({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<ServiceResourcesFormData>({
    mode: 'onChange',
    defaultValues: getDefaultValues(service, advancedSettings),
  })

  useEffect(() => {
    if (!advancedSettings) {
      return
    }

    const hpaSettings = loadHpaSettingsFromAdvancedSettings(advancedSettings)
    methods.setValue('hpa_metric_type', hpaSettings.hpa_metric_type)
    methods.setValue('hpa_cpu_average_utilization_percent', hpaSettings.hpa_cpu_average_utilization_percent)
    methods.setValue('hpa_memory_average_utilization_percent', hpaSettings.hpa_memory_average_utilization_percent)
  }, [advancedSettings, methods])

  const onSubmit = methods.handleSubmit(async (data) => {
    const baseRequest = {
      memory: Number(data.memory),
      cpu: Number(data.cpu),
      gpu: Number(data.gpu),
    }

    const requestWithInstances =
      service.serviceType !== 'JOB'
        ? buildAutoscalingRequestFromForm(data as unknown as Record<string, unknown>, baseRequest)
        : baseRequest

    const payload = match(service)
      .with({ serviceType: 'JOB' }, (job) => buildEditServicePayload({ service: job, request: baseRequest }))
      .with({ serviceType: 'APPLICATION' }, (application) =>
        buildEditServicePayload({
          service: application,
          request: requestWithInstances,
        })
      )
      .with({ serviceType: 'CONTAINER' }, (container) =>
        buildEditServicePayload({
          service: container,
          request: requestWithInstances,
        })
      )
      .with({ serviceType: 'TERRAFORM' }, (terraform) =>
        buildEditServicePayload({
          service: terraform,
          request: {
            job_resources: {
              cpu_milli: Number(data.cpu),
              ram_mib: Number(data.memory),
              storage_gib: Number(data.storage_gib),
              gpu: Number(data.gpu),
            },
          },
        })
      )
      .exhaustive()

    if (data.autoscaling_mode === 'HPA' && advancedSettings) {
      await editAdvancedSettings({
        serviceId: service.id,
        payload: {
          serviceType: service.serviceType,
          ...buildHpaAdvancedSettingsPayload(data as unknown as Record<string, unknown>, advancedSettings),
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
      <ServiceResourcesSettingsForm
        service={service}
        onSubmit={onSubmit}
        loading={isLoadingEditService || isLoadingEditAdvancedSettings}
        displayWarningCpu={displayWarningCpu}
        advancedSettings={advancedSettings}
      />
    </FormProvider>
  )
}

export default ServiceResourcesSettings
