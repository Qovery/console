import posthog from 'posthog-js'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { hasGpuInstance, useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { KedaSettings, useRunningStatus } from '@qovery/domains/services/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import {
  Callout,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  InputText,
  Link,
  Section,
  inputSizeUnitRules,
} from '@qovery/shared/ui'
import { loadHpaSettingsFromAdvancedSettings } from '@qovery/shared/util-services'
import { FixedInstancesMode } from './fixed-instances-mode'
import { HpaAutoscalingMode } from './hpa-autoscaling-mode'

export interface ApplicationSettingsResourcesProps {
  displayWarningCpu: boolean
  displayInstanceLimits?: boolean
  service?: Exclude<AnyService, Helm | Database>
  minInstances?: number
  maxInstances?: number
  advancedSettings?: unknown
}

export function ApplicationSettingsResources({
  displayWarningCpu,
  displayInstanceLimits = true,
  service,
  minInstances = 1,
  maxInstances = 1000,
  advancedSettings,
}: ApplicationSettingsResourcesProps) {
  const { control, watch, setValue } = useFormContext()
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: runningStatuses } = useRunningStatus({ environmentId, serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({ clusterId: environment?.cluster_id ?? '', organizationId })
  const isKedaFeatureEnabled = useFeatureFlagVariantKey('keda')
  const clusterFeatureKarpenter = cluster?.features?.find((f) => f.id === 'KARPENTER')
  const isKarpenterCluster = Boolean(clusterFeatureKarpenter)
  const isKedaCluster = Boolean(cluster?.keda?.enabled)
  const canSetGPU = hasGpuInstance(cluster)

  const clusterId = environment?.cluster_id
  const environmentMode = environment?.mode

  const cloudProvider = environment?.cloud_provider.provider

  const maxMemoryBySize = service && 'maximum_memory' in service ? service.maximum_memory : 128000

  const scalersFieldArray = useFieldArray({
    control,
    name: 'scalers',
  })

  const minRunningInstances = watch('min_running_instances')
  const maxRunningInstances = watch('max_running_instances')
  const hpaMetricTypeRaw = watch('hpa_metric_type')
  const hpaMetricType = hpaMetricTypeRaw || 'CPU'
  const autoscalingMode = watch('autoscaling_mode') || 'NONE'
  const hpaAverageUtilizationPercent = watch('hpa_cpu_average_utilization_percent') ?? 60
  const hpaMemoryAverageUtilizationPercent = watch('hpa_memory_average_utilization_percent') ?? 60
  const previousAutoscalingModeRef = useRef(autoscalingMode)

  // Adjust min/max values when switching from NONE to HPA or KEDA
  useEffect(() => {
    const previousMode = previousAutoscalingModeRef.current
    if (previousMode === 'NONE' && (autoscalingMode === 'HPA' || autoscalingMode === 'KEDA')) {
      // When switching from no autoscaling to HPA/KEDA, set min=1 and max=2
      if (minRunningInstances === maxRunningInstances) {
        setValue('min_running_instances', 1)
        setValue('max_running_instances', 2)
      }
    }

    // Set default HPA settings when switching to HPA mode
    if (autoscalingMode === 'HPA' && !hpaMetricTypeRaw) {
      const hpaSettings = loadHpaSettingsFromAdvancedSettings(advancedSettings)
      setValue('hpa_metric_type', hpaSettings.hpa_metric_type)
      setValue('hpa_cpu_average_utilization_percent', hpaSettings.hpa_cpu_average_utilization_percent)
      setValue('hpa_memory_average_utilization_percent', hpaSettings.hpa_memory_average_utilization_percent)
    }

    previousAutoscalingModeRef.current = autoscalingMode
  }, [autoscalingMode, minRunningInstances, maxRunningInstances, hpaMetricTypeRaw, advancedSettings, setValue])

  // Determine the current saved autoscaling mode (not the form value)
  const currentAutoscalingMode = match(service)
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
    .otherwise(() => 'NONE')

  const minVCpu = match(cloudProvider)
    .with('GCP', () => 250)
    .otherwise(() => 10)

  const minMemory = match(cloudProvider)
    .with('GCP', () => 512)
    .otherwise(() => 1)

  const hintCPU = match(cloudProvider)
    .with('GCP', () => (
      <>
        Minimum value is {minVCpu} milli vCPU. Note that resources might be rounded up automatically by GCP.
        <ExternalLink
          size="xs"
          href="https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-resource-requests"
        >
          Have a look at this documentation
        </ExternalLink>
      </>
    ))
    .otherwise(() => (
      <>
        Minimum value is {minVCpu} milli vCPU.{' '}
        {service && (
          <>
            {'maximum_cpu' in service &&
              !isKarpenterCluster &&
              `Maximum value allowed based on the selected cluster instance type: ${service.maximum_cpu} milli vCPU. `}
            {clusterId && (
              <Link
                to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
                size="xs"
              >
                Edit node
              </Link>
            )}
          </>
        )}
      </>
    ))

  const hintMemory = match(cloudProvider)
    .with('GCP', () => (
      <>
        Minimum value is {minMemory} MiB. Note that resources might be rounded up automatically by GCP.{' '}
        <ExternalLink
          size="xs"
          href="https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-resource-requests"
        >
          Have a look at this documentation
        </ExternalLink>
      </>
    ))
    .otherwise(() => (
      <>
        Minimum value is {minMemory} MiB.{' '}
        {service && (
          <>
            {'maximum_memory' in service &&
              !isKarpenterCluster &&
              `Maximum value allowed based on the selected cluster instance type: ${service.maximum_memory} MiB. `}
            {clusterId && (
              <Link
                to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
                size="xs"
              >
                Edit node
              </Link>
            )}
          </>
        )}
      </>
    ))

  const hintGPU = service && (
    <>
      {!canSetGPU && 'GPUs not allowed on this cluster. '}
      {clusterId && (
        <Link
          to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
          size="xs"
        >
          {canSetGPU ? 'Edit node' : 'Enable it here'}
        </Link>
      )}
    </>
  )

  // KEDA allows 0 instances (scale to zero), other modes require at least 1
  const effectiveMinInstances = autoscalingMode === 'KEDA' ? 0 : minInstances

  return (
    <>
      <Section className="gap-4">
        <Heading>Resources configuration</Heading>
        <Controller
          name="cpu"
          control={control}
          rules={{
            min: minVCpu,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              name={field.name}
              label="vCPU (milli)"
              value={field.value}
              onChange={field.onChange}
              hint={hintCPU}
              error={error?.type === 'min' ? `Minimum allowed ${field.name} is: ${minVCpu} milli vCPU.` : undefined}
            />
          )}
        />
        {displayWarningCpu && (
          <Callout.Root color="red" className="mt-3" data-testid="banner-box">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Not enough resources</Callout.TextHeading>
              <Callout.TextDescription>
                Increase the capacity of your cluster nodes or reduce the service consumption.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
        <Controller
          name="memory"
          control={control}
          rules={inputSizeUnitRules(maxMemoryBySize, minMemory)}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-memory-memory"
              type="number"
              name={field.name}
              label="Memory (MiB)"
              value={field.value}
              onChange={field.onChange}
              hint={hintMemory}
              error={
                error?.type === 'required'
                  ? 'Please enter a size.'
                  : error?.type === 'max'
                    ? `Maximum allowed ${field.name} is: ${maxMemoryBySize} MiB.`
                    : error?.type === 'min'
                      ? `Minimum allowed ${field.name} is: ${minMemory} MiB.`
                      : undefined
              }
            />
          )}
        />
        {isKarpenterCluster && (
          <Controller
            name="gpu"
            control={control}
            rules={{
              pattern: {
                value: /^[0-9]+$/,
                message: 'Please enter a number.',
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-gpu"
                type="number"
                name={field.name}
                label="GPU (units)"
                value={field.value}
                onChange={field.onChange}
                disabled={!canSetGPU}
                hint={hintGPU}
                error={error?.message}
              />
            )}
          />
        )}

        {service?.serviceType === 'TERRAFORM' && (
          <Controller
            name="storage_gib"
            control={control}
            rules={{
              required: 'Please set a value.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-storage"
                type="number"
                name={field.name}
                label="Storage (GiB)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        )}
      </Section>

      {!['JOB', 'TERRAFORM'].includes(service?.serviceType || '') && displayInstanceLimits && (
        <Section className="gap-4">
          <Heading>Instances & Autoscaling</Heading>

          <>
            <Controller
              name="autoscaling_mode"
              control={control}
              render={({ field }) => {
                const options = [
                  { label: 'No autoscaling (fixed instances)', value: 'NONE' },
                  { label: 'HPA (Horizontal Pod Autoscaler)', value: 'HPA' },
                ]

                if (cloudProvider === 'AWS' && isKedaCluster && isKedaFeatureEnabled) {
                  options.push({ label: 'KEDA (Event-driven autoscaling)', value: 'KEDA' })
                }

                return (
                  <InputSelect
                    label="Autoscaling mode"
                    options={options}
                    onChange={(value) => {
                      field.onChange(value)

                      if (value === 'KEDA') {
                        posthog.capture('service-autoscaling-keda-selected', {
                          min_running_instances: minRunningInstances,
                          max_running_instances: maxRunningInstances,
                        })
                      }
                    }}
                    value={field.value || 'NONE'}
                    hint="Choose how instances should scale"
                  />
                )
              }}
            />
            {currentAutoscalingMode === 'HPA' && autoscalingMode === 'KEDA' && isKedaFeatureEnabled && (
              <Callout.Root color="yellow">
                <Callout.Icon>
                  <Icon iconName="circle-info" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>KEDA migration restriction</Callout.TextHeading>
                  <Callout.TextDescription className="text-xs">
                    You cannot migrate directly from HPA to KEDA. Please first switch to "No autoscaling" mode, save the
                    changes and deploy your service, and then you can configure KEDA autoscaling.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}
          </>

          {/* Mode NONE: Fixed instances */}
          {autoscalingMode === 'NONE' && (
            <FixedInstancesMode
              control={control}
              setValue={setValue}
              minInstances={effectiveMinInstances}
              maxInstances={maxInstances}
              environmentMode={environmentMode}
            />
          )}

          {/* Mode HPA: Horizontal Pod Autoscaler */}
          {autoscalingMode === 'HPA' && (
            <HpaAutoscalingMode
              control={control}
              setValue={setValue}
              minInstances={effectiveMinInstances}
              maxInstances={maxInstances}
              minRunningInstances={minRunningInstances}
              hpaMetricType={hpaMetricType}
              hpaAverageUtilizationPercent={hpaAverageUtilizationPercent}
              hpaMemoryAverageUtilizationPercent={hpaMemoryAverageUtilizationPercent}
              runningPods={runningStatuses?.pods?.length}
              environmentMode={environmentMode}
            />
          )}

          {/* Mode KEDA: Event-driven autoscaling */}
          {autoscalingMode === 'KEDA' && (
            <KedaSettings
              control={control}
              scalersFieldArray={scalersFieldArray}
              minInstances={effectiveMinInstances}
              maxInstances={maxInstances}
              minRunningInstances={minRunningInstances}
              disabled={currentAutoscalingMode === 'HPA'}
              runningPods={runningStatuses?.pods?.length}
            />
          )}
        </Section>
      )}
    </>
  )
}
