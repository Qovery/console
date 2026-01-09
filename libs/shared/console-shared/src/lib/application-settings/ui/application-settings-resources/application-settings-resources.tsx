import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { hasGpuInstance, useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { useRunningStatus } from '@qovery/domains/services/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import {
  Button,
  Callout,
  CodeEditor,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  InputText,
  InputTextArea,
  InputToggle,
  Link,
  Section,
  inputSizeUnitRules,
} from '@qovery/shared/ui'

type ClusterWithKeda = {
  keda?: {
    enabled?: boolean
  }
}

export interface ApplicationSettingsResourcesProps {
  displayWarningCpu: boolean
  displayInstanceLimits?: boolean
  service?: Exclude<AnyService, Helm | Database>
  minInstances?: number
  maxInstances?: number
}

export function ApplicationSettingsResources({
  displayWarningCpu,
  displayInstanceLimits = true,
  service,
  minInstances = 1,
  maxInstances = 1000,
}: ApplicationSettingsResourcesProps) {
  const { control, watch, setValue } = useFormContext()
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: runningStatuses } = useRunningStatus({ environmentId, serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({ clusterId: environment?.cluster_id ?? '', organizationId })
  const { isQoveryAdminUser } = useUserRole()
  const clusterFeatureKarpenter = cluster?.features?.find((f) => f.id === 'KARPENTER')
  const isKarpenterCluster = Boolean(clusterFeatureKarpenter)
  const clusterWithKeda = cluster as ClusterWithKeda | undefined
  const isKedaCluster = Boolean(clusterWithKeda?.keda?.enabled)
  const canSetGPU = hasGpuInstance(cluster)

  const clusterId = environment?.cluster_id
  const environmentMode = environment?.mode

  const cloudProvider = environment?.cloud_provider.provider

  const maxMemoryBySize = service && 'maximum_memory' in service ? service.maximum_memory : 128000

  const minRunningInstances = watch('min_running_instances')
  const scalers = watch('scalers') || []
  const hpaMetricType = watch('hpa_metric_type') || 'CPU'
  const hpaAverageUtilizationPercent = watch('hpa_cpu_average_utilization_percent') ?? 60
  const hpaMemoryAverageUtilizationPercent = watch('hpa_memory_average_utilization_percent') ?? 60

  const handleAddScaler = () => {
    setValue('scalers', [...scalers, { type: '', config: '' }])
  }

  const handleRemoveScaler = (index: number) => {
    setValue(
      'scalers',
      scalers.filter((_: unknown, i: number) => i !== index)
    )
  }

  const autoscalingMode = watch('autoscaling_mode') || 'NONE'

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

          {isQoveryAdminUser && cloudProvider === 'AWS' && isKedaCluster ? (
            <>
              <Controller
                name="autoscaling_mode"
                control={control}
                render={({ field }) => (
                  <InputSelect
                    label="Autoscaling mode"
                    options={[
                      { label: 'No autoscaling (fixed instances)', value: 'NONE' },
                      { label: 'HPA (Horizontal Pod Autoscaler)', value: 'HPA' },
                      { label: 'KEDA (Event-driven autoscaling)', value: 'KEDA' },
                    ]}
                    onChange={field.onChange}
                    value={field.value || 'NONE'}
                    hint="Choose how instances should scale"
                  />
                )}
              />
              {currentAutoscalingMode === 'HPA' && autoscalingMode === 'KEDA' && (
                <Callout.Root color="yellow">
                  <Callout.Icon>
                    <Icon iconName="circle-info" />
                  </Callout.Icon>
                  <Callout.Text>
                    <Callout.TextHeading>KEDA migration restriction</Callout.TextHeading>
                    <Callout.TextDescription className="text-xs">
                      You cannot migrate directly from HPA to KEDA. Please first switch to "No autoscaling" mode, save
                      the changes, and then you can configure KEDA autoscaling.
                    </Callout.TextDescription>
                  </Callout.Text>
                </Callout.Root>
              )}
            </>
          ) : null}

          {/* Mode NONE: Fixed instances */}
          {autoscalingMode === 'NONE' && (
            <>
              <Controller
                name="min_running_instances"
                control={control}
                rules={{
                  required: true,
                  min: minInstances,
                  max: maxInstances,
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    type="number"
                    label="Number of instances"
                    name={field.name}
                    value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
                    onChange={(e) => {
                      const output = parseInt(e.target.value, 10)
                      const value = isNaN(output) ? 0 : output
                      field.onChange(value)
                      // Set max = min for fixed instances
                      setValue('max_running_instances', value)
                    }}
                    error={
                      error?.type === 'required'
                        ? 'Please enter a size.'
                        : error?.type === 'max'
                          ? `Maximum allowed is: ${maxInstances}.`
                          : error?.type === 'min'
                            ? `Minimum allowed is: ${minInstances}.`
                            : undefined
                    }
                  />
                )}
              />
              <Callout.Root color="sky" className="mt-3">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  With fixed instances, your service will always run the exact number of instances specified above.
                </Callout.Text>
              </Callout.Root>
            </>
          )}

          {/* Mode HPA: Horizontal Pod Autoscaler */}
          {autoscalingMode === 'HPA' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="min_running_instances"
                  control={control}
                  rules={{
                    required: true,
                    min: minInstances,
                    max: maxInstances,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      label="Instances min"
                      name={field.name}
                      value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
                      onChange={(e) => {
                        const output = parseInt(e.target.value, 10)
                        const value = isNaN(output) ? 0 : output
                        field.onChange(value)
                      }}
                      error={
                        error?.type === 'required'
                          ? 'Please enter a size.'
                          : error?.type === 'max'
                            ? `Maximum allowed is: ${maxInstances}.`
                            : error?.type === 'min'
                              ? `Minimum allowed is: ${minInstances}.`
                              : undefined
                      }
                    />
                  )}
                />
                <Controller
                  name="max_running_instances"
                  control={control}
                  rules={{
                    required: true,
                    max: maxInstances,
                    min: minRunningInstances,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      label="Instances max"
                      name={field.name}
                      value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
                      onChange={(e) => {
                        const output = parseInt(e.target.value, 10)
                        const value = isNaN(output) ? 0 : output
                        field.onChange(value)
                      }}
                      error={
                        error?.type === 'required'
                          ? 'Please enter a size.'
                          : error?.type === 'max'
                            ? `Maximum allowed is: ${maxInstances}.`
                            : error?.type === 'min'
                              ? `Minimum allowed is: ${minRunningInstances}.`
                              : undefined
                      }
                    />
                  )}
                />
              </div>

              <p className="text-xs text-neutral-350">
                {runningStatuses?.pods && (
                  <span className="mb-1 flex">
                    Current consumption: {runningStatuses.pods.length} instance
                    {runningStatuses.pods.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>

              <Callout.Root color="sky" className="mt-3">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  Auto-scaling will automatically scale your service based on{' '}
                  {hpaMetricType === 'CPU_AND_MEMORY' ? 'CPU and Memory' : 'CPU'} utilization. Scaling occurs when the
                  average exceeds
                  {hpaMetricType === 'CPU_AND_MEMORY'
                    ? ` CPU ${hpaAverageUtilizationPercent}% and Memory ${hpaMemoryAverageUtilizationPercent}%`
                    : ` ${hpaAverageUtilizationPercent}%`}{' '}
                  for a continuous period.
                </Callout.Text>
              </Callout.Root>

              <Callout.Root color="yellow" className="mt-3">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <p>Always assume one instance may fail due to node maintenance or issues.</p>
                  <p>To ensure high availability, set Minimum Instances to 2 if your app can run on 1 instance.</p>
                  <p>
                    If your application requires more than one instance to handle necessary traffic, set the minimum to
                    3 or higher to guarantee redundancy during a single failure.
                  </p>
                </Callout.Text>
              </Callout.Root>

              <Controller
                name="hpa_metric_type"
                control={control}
                render={({ field }) => (
                  <InputSelect
                    label="Metric type"
                    options={[
                      { label: 'CPU', value: 'CPU' },
                      { label: 'CPU and Memory', value: 'CPU_AND_MEMORY' },
                    ]}
                    onChange={field.onChange}
                    value={field.value || 'CPU'}
                  />
                )}
              />

              <Controller
                name="hpa_cpu_average_utilization_percent"
                control={control}
                rules={{
                  min: 1,
                  max: 100,
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    type="number"
                    label={
                      hpaMetricType === 'CPU_AND_MEMORY' ? 'CPU average utilization (%)' : 'Average utilization (%)'
                    }
                    name={field.name}
                    value={field.value ?? 60}
                    onChange={field.onChange}
                    hint="Scaling triggers when average utilization exceeds this percentage (default: 60%)"
                    error={
                      error?.type === 'min' ? 'Minimum is 1%.' : error?.type === 'max' ? 'Maximum is 100%.' : undefined
                    }
                  />
                )}
              />

              {hpaMetricType === 'CPU_AND_MEMORY' && (
                <Controller
                  name="hpa_memory_average_utilization_percent"
                  control={control}
                  rules={{
                    min: 1,
                    max: 100,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      label="Memory average utilization (%)"
                      name={field.name}
                      value={field.value ?? 60}
                      onChange={field.onChange}
                      hint="Scaling triggers when average memory utilization exceeds this percentage (default: 60%)"
                      error={
                        error?.type === 'min'
                          ? 'Minimum is 1%.'
                          : error?.type === 'max'
                            ? 'Maximum is 100%.'
                            : undefined
                      }
                    />
                  )}
                />
              )}
            </>
          )}

          {/* Mode KEDA: Event-driven autoscaling */}
          {autoscalingMode === 'KEDA' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="min_running_instances"
                  control={control}
                  rules={{
                    required: true,
                    min: minInstances,
                    max: maxInstances,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      label="Instances min"
                      name={field.name}
                      value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
                      onChange={(e) => {
                        const output = parseInt(e.target.value, 10)
                        const value = isNaN(output) ? 0 : output
                        field.onChange(value)
                      }}
                      disabled={currentAutoscalingMode === 'HPA'}
                      error={
                        error?.type === 'required'
                          ? 'Please enter a size.'
                          : error?.type === 'max'
                            ? `Maximum allowed is: ${maxInstances}.`
                            : error?.type === 'min'
                              ? `Minimum allowed is: ${minInstances}.`
                              : undefined
                      }
                    />
                  )}
                />
                <Controller
                  name="max_running_instances"
                  control={control}
                  rules={{
                    required: true,
                    max: maxInstances,
                    min: minRunningInstances,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      label="Instances max"
                      name={field.name}
                      value={isNaN(field.value) || field.value === 0 ? '' : field.value.toString()}
                      onChange={(e) => {
                        const output = parseInt(e.target.value, 10)
                        const value = isNaN(output) ? 0 : output
                        field.onChange(value)
                      }}
                      disabled={currentAutoscalingMode === 'HPA'}
                      error={
                        error?.type === 'required'
                          ? 'Please enter a size.'
                          : error?.type === 'max'
                            ? `Maximum allowed is: ${maxInstances}.`
                            : error?.type === 'min'
                              ? `Minimum allowed is: ${minRunningInstances}.`
                              : undefined
                      }
                    />
                  )}
                />
              </div>

              <p className="text-xs text-neutral-350">
                {runningStatuses?.pods && (
                  <span className="mb-1 flex">
                    Current consumption: {runningStatuses.pods.length} instance
                    {runningStatuses.pods.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>

              <Callout.Root color="yellow" className="mt-3">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <p>Always assume one instance may fail due to node maintenance or issues.</p>
                  <p>To ensure high availability, set Minimum Instances to 2 if your app can run on 1 instance.</p>
                  <p>
                    If your application requires more than one instance to handle necessary traffic, set the minimum to
                    3 or higher to guarantee redundancy during a single failure.
                  </p>
                </Callout.Text>
              </Callout.Root>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="autoscaling_polling_interval"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      name={field.name}
                      label="Polling Interval (seconds)"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      disabled={currentAutoscalingMode === 'HPA'}
                      hint="Default: 30 seconds"
                      error={error?.message}
                    />
                  )}
                />
                <Controller
                  name="autoscaling_cooldown_period"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      name={field.name}
                      label="Cooldown Period (seconds)"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      disabled={currentAutoscalingMode === 'HPA'}
                      hint="Default: 300 seconds"
                      error={error?.message}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-400">Scalers</label>
                  <Button size="xs" type="button" onClick={handleAddScaler} disabled={currentAutoscalingMode === 'HPA'}>
                    Add scaler
                  </Button>
                </div>

                {scalers.length === 0 && (
                  <p className="text-xs text-neutral-350">No scalers configured. Click "Add scaler" to get started.</p>
                )}

                {scalers.map((_: unknown, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded border border-neutral-250 bg-neutral-100 p-4"
                    data-testid="scaler-row"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-400">Scaler #{index + 1}</span>
                      <Button
                        size="xs"
                        type="button"
                        variant="surface"
                        color="red"
                        onClick={() => handleRemoveScaler(index)}
                        disabled={currentAutoscalingMode === 'HPA'}
                      >
                        Remove
                      </Button>
                    </div>

                    <Controller
                      name={`scalers.${index}.type`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputText
                          name={field.name}
                          label="Scaler Type"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          disabled={currentAutoscalingMode === 'HPA'}
                          hint="Type: 'cpu', 'memory', 'prometheus', 'aws-sqs', etc."
                          error={error?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`scalers.${index}.config`}
                      control={control}
                      render={({ field }) => {
                        const lineCount = (field.value ?? '').split('\n').length
                        const displayLines = Math.min(Math.max(lineCount, 3), 5)
                        const height = `${displayLines * 19 + 10}px`

                        return (
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-neutral-400">Configuration (YAML)</label>
                            <CodeEditor
                              height={height}
                              language="yaml"
                              value={field.value ?? ''}
                              onChange={(value) => field.onChange(value ?? '')}
                              options={{
                                readOnly: currentAutoscalingMode === 'HPA',
                              }}
                            />
                            <p className="text-xs text-neutral-350">Paste raw YAML for this scaler</p>
                          </div>
                        )
                      }}
                    />

                    <Controller
                      name={`scalers.${index}.triggerAuthentication`}
                      control={control}
                      render={({ field }) => {
                        const lineCount = (field.value ?? '').split('\n').length
                        const displayLines = Math.min(Math.max(lineCount, 3), 5)
                        const height = `${displayLines * 19 + 10}px`

                        return (
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-neutral-400">
                              Trigger Authentication (YAML) - Optional
                            </label>
                            <CodeEditor
                              height={height}
                              language="yaml"
                              value={field.value ?? ''}
                              onChange={(value) => field.onChange(value ?? '')}
                              options={{
                                readOnly: currentAutoscalingMode === 'HPA',
                              }}
                            />
                            <p className="text-xs text-neutral-350">
                              Paste raw YAML for the trigger authentication (optional)
                            </p>
                          </div>
                        )
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {autoscalingMode === 'NONE' &&
            environmentMode === EnvironmentModeEnum.PRODUCTION &&
            minRunningInstances === 1 && (
              <Callout.Root color="yellow" className="mt-3">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  We strongly discourage running your production environment with only one instance. This setup might
                  create service downtime in case of cluster upgrades. Set a minimum of 2 instances for your service to
                  ensure high availability.
                </Callout.Text>
              </Callout.Root>
            )}
        </Section>
      )}
    </>
  )
}

export default ApplicationSettingsResources
