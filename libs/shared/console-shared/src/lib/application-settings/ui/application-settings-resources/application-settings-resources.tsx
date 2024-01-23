import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { useRunningStatus } from '@qovery/domains/services/feature'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Callout,
  ExternalLink,
  Icon,
  IconAwesomeEnum,
  InputText,
  Link,
  Slider,
  inputSizeUnitRules,
} from '@qovery/shared/ui'

export interface ApplicationSettingsResourcesProps {
  displayWarningCpu: boolean
  service?: Exclude<AnyService, Helm | Database>
  minInstances?: number
  maxInstances?: number
}

export function ApplicationSettingsResources({
  displayWarningCpu,
  service,
  minInstances = 1,
  maxInstances = 50,
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

  const watchInstances = watch('instances')

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
    <div>
      <BlockContent title="vCPU">
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
              label="Size (in milli vCPU)"
              value={field.value}
              onChange={field.onChange}
              error={error?.type === 'min' ? `Minimum allowed ${field.name} is: ${minVCpu} milli vCPU.` : undefined}
            />
          )}
        />
        <p className="text-neutral-350 text-xs mt-3">{hintCPU}</p>
        {displayWarningCpu && (
          <Callout.Root color="red" className="mt-3" data-testid="banner-box">
            <Callout.Icon>
              <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Not enough resources</Callout.TextHeading>
              <Callout.TextDescription>
                Increase the capacity of your cluster nodes or reduce the service consumption.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
      </BlockContent>
      <BlockContent title="Memory">
        <Controller
          name="memory"
          control={control}
          rules={inputSizeUnitRules(maxMemoryBySize, minMemory)}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-memory-memory"
              type="number"
              name={field.name}
              label="Size in MiB"
              value={field.value}
              onChange={field.onChange}
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
        <p className="text-neutral-350 text-xs mt-3">{hintMemory}</p>
      </BlockContent>

      {service?.serviceType !== 'JOB' && watchInstances && (
        <BlockContent title="Instances">
          <p className="text-neutral-400 mb-3 font-medium">{`${watchInstances[0]} - ${watchInstances[1]}`}</p>
          <Controller
            name="instances"
            control={control}
            render={({ field }) => (
              <Slider min={minInstances} max={maxInstances} step={1} onChange={field.onChange} value={field.value} />
            )}
          />
          <p className="text-neutral-350 text-xs mt-3">
            {runningStatuses?.pods && (
              <span className="flex mb-1">
                Current consumption: {runningStatuses.pods.length} instance
                {runningStatuses.pods.length > 1 ? 's' : ''}
              </span>
            )}
            Application auto-scaling is based on real-time CPU consumption. When your app goes above 60% (default) of
            CPU consumption for 5 minutes, your app will be auto-scaled and more instances will be added.
          </p>
          {environmentMode === EnvironmentModeEnum.PRODUCTION && watchInstances[0] === 1 && (
            <Callout.Root color="yellow" className="mt-3" data-testid="banner-box">
              <Callout.Icon>
                <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
              </Callout.Icon>
              <Callout.Text>
                We strongly discourage running your production environment with only one instance. This setup might
                create service downtime in case of cluster upgrades. Set a minimum of 2 instances for your service to
                ensure high availability.
              </Callout.Text>
            </Callout.Root>
          )}
        </BlockContent>
      )}
    </div>
  )
}

export default ApplicationSettingsResources
