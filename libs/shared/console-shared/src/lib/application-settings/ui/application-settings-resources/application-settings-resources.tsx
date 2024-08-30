import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { useRunningStatus } from '@qovery/domains/services/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Callout, ExternalLink, Heading, Icon, InputText, Link, Section, inputSizeUnitRules } from '@qovery/shared/ui'

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
  const { control, watch } = useFormContext()
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: runningStatuses } = useRunningStatus({ environmentId, serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId })

  const clusterId = environment?.cluster_id
  const environmentMode = environment?.mode

  const cloudProvider = environment?.cloud_provider.provider

  let maxMemoryBySize = service?.maximum_memory

  if (!service) {
    // until api allows us to fetch the max possible value
    maxMemoryBySize = 128000
  }

  const minRunningInstances = watch('min_running_instances')

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
            Maximum value allowed based on the selected cluster instance type: {service.maximum_cpu} milli vCPU.{' '}
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
            Maximum value allowed based on the selected cluster instance type: {service.maximum_memory} MiB.{' '}
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
      </Section>

      {service?.serviceType !== 'JOB' && displayInstanceLimits && (
        <Section className="gap-4">
          <Heading>Instances</Heading>
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
                    // https://react-hook-form.com/advanced-usage#TransformandParse
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
                    // https://react-hook-form.com/advanced-usage#TransformandParse
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
            Application auto-scaling is based on real-time CPU consumption. When your app goes above 60% (default) of
            CPU consumption for 5 minutes, your app will be auto-scaled and more instances will be added.
          </p>
          {environmentMode === EnvironmentModeEnum.PRODUCTION && minRunningInstances === 1 && (
            <Callout.Root color="yellow" className="mt-3" data-testid="banner-box">
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
