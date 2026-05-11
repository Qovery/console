import {
  CloudProviderEnum,
  type DatabaseTypeEnum,
  type ManagedDatabaseInstanceTypeResponse,
} from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCloudProviderDatabaseInstanceTypes } from '@qovery/domains/cloud-providers/feature'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type Database } from '@qovery/domains/services/data-access'
import { type Value } from '@qovery/shared/interfaces'
import { Callout, ExternalLink, Icon, InputSelect, InputText, Link, inputSizeUnitRules } from '@qovery/shared/ui'

interface SettingsResourcesInstanceTypesProps {
  databaseType: DatabaseTypeEnum
  displayWarning: boolean
  isSetting: boolean
  organizationId: string
  environmentId: string
}

function SettingsResourcesInstanceTypes({
  databaseType,
  displayWarning,
  isSetting,
  organizationId,
  environmentId,
}: SettingsResourcesInstanceTypesProps) {
  const { control, setValue } = useFormContext()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })
  const { data: databaseInstanceTypes } = useCloudProviderDatabaseInstanceTypes(
    match(cluster?.cloud_provider || CloudProviderEnum.AWS)
      .with('AWS', (cloudProvider) => ({
        cloudProvider,
        databaseType,
        region: cluster?.region || '',
      }))
      .with('SCW', (cloudProvider) => ({
        cloudProvider,
        databaseType,
      }))
      .with('GCP', (cloudProvider) => ({
        cloudProvider,
        databaseType,
      }))
      .with('ON_PREMISE', 'DO', 'AZURE', 'CIVO', 'HETZNER', 'IBM', 'ORACLE', 'OVH', () => ({
        cloudProvider: CloudProviderEnum.ON_PREMISE,
        databaseType,
      }))
      .exhaustive()
  )

  const databaseInstanceTypeOptions: Value[] = useMemo(
    () =>
      databaseInstanceTypes?.map((instanceType: ManagedDatabaseInstanceTypeResponse) => ({
        label: instanceType.name,
        value: instanceType.name,
      })) ?? [],
    [databaseInstanceTypes]
  )

  useEffect(() => {
    if (!isSetting && databaseInstanceTypes) {
      const defaultInstanceType = match(databaseType)
        .with('POSTGRESQL', () => 'db.t3.small')
        .with('MONGODB', () => 'db.t3.small')
        .with('MYSQL', () => 'db.t3.small')
        .with('REDIS', () => 'cache.t3.small')
        .exhaustive()

      setValue('instance_type', defaultInstanceType)
    }
  }, [databaseInstanceTypes, databaseType, isSetting, setValue])

  return (
    <>
      <Controller
        name="instance_type"
        control={control}
        rules={{
          required: 'Please select an instance type',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            isSearchable
            onChange={field.onChange}
            value={field.value}
            label="Instance type"
            error={error?.message}
            options={databaseInstanceTypeOptions}
            hint="The chosen instance type has a direct impact on your cloud provider cost."
          />
        )}
      />
      {displayWarning && (
        <Callout.Root className="mt-3" color="yellow" data-testid="settings-resources-instance-types-warning">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            Once triggered, the update will be managed by your cloud provider and applied during the configured
            maintenance window. Moreover, the operation might cause a service interruption.{' '}
            <ExternalLink
              className="mt-1"
              href="https://www.qovery.com/docs/configuration/database#applying-changes-to-a-managed-database"
            >
              Have a look at the documentation first
            </ExternalLink>
          </Callout.Text>
        </Callout.Root>
      )}
    </>
  )
}

export interface DatabaseSettingsResourcesProps {
  database?: Database
  isManaged?: boolean
  clusterId?: string
  databaseType?: DatabaseTypeEnum
  displayInstanceTypesWarning?: boolean
  displayStorageWarning?: boolean
  isSetting?: boolean
}

export function DatabaseSettingsResources({
  database,
  databaseType,
  isManaged = false,
  clusterId = '',
  displayInstanceTypesWarning = false,
  displayStorageWarning = false,
  isSetting = false,
}: DatabaseSettingsResourcesProps) {
  const {
    control,
    formState: { defaultValues },
  } = useFormContext()
  const { organizationId = '', environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  const resolvedDatabaseType = database?.type ?? databaseType
  const maxMemoryBySize = database?.maximum_memory
  const cloudProvider = environment?.cloud_provider.provider

  const minVCpu = match(cloudProvider)
    .with('GCP', () => 250)
    .otherwise(() => 10)

  const minMemory = match(cloudProvider)
    .with('GCP', () => 512)
    .otherwise(() => 1)

  // For GP3 DBs, the minimum storage is 20 GiB, whereas for GP2 it's 10 GiB
  const minStorageValue = defaultValues?.['storage'] !== 10 ? 20 : 10

  return (
    <>
      {!isManaged && (
        <>
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
                hint={
                  <>
                    Minimum value is {minVCpu} milli vCPU.{' '}
                    {database && (
                      <>
                        Maximum value allowed based on the selected cluster instance type: {database?.maximum_cpu} milli
                        vCPU.{' '}
                        {clusterId && (
                          <Link
                            to="/organization/$organizationId/cluster/$clusterId/settings/resources"
                            params={{ organizationId, clusterId }}
                            size="xs"
                          >
                            Edit node
                          </Link>
                        )}
                      </>
                    )}
                  </>
                }
                error={error?.type === 'min' ? `Minimum allowed ${field.name} is: ${minVCpu} milli vCPU.` : undefined}
              />
            )}
          />
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
                hint={
                  <>
                    Minimum value is {minMemory} MiB.{' '}
                    {database && (
                      <>
                        Maximum value allowed based on the selected cluster instance type: {database?.maximum_memory}{' '}
                        MiB.{' '}
                        {clusterId && (
                          <Link
                            to="/organization/$organizationId/cluster/$clusterId/settings/resources"
                            params={{ organizationId, clusterId }}
                            size="xs"
                          >
                            Edit node
                          </Link>
                        )}
                      </>
                    )}
                  </>
                }
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
        </>
      )}
      {isManaged && resolvedDatabaseType && (
        <SettingsResourcesInstanceTypes
          databaseType={resolvedDatabaseType}
          displayWarning={displayInstanceTypesWarning}
          isSetting={isSetting}
          organizationId={organizationId}
          environmentId={environmentId}
        />
      )}
      {/* Storage is not configurable for Redis managed databases (ElastiCache) - capacity is determined by node type */}
      <Controller
        name="storage"
        control={control}
        rules={
          isManaged && resolvedDatabaseType === 'REDIS'
            ? undefined
            : {
                pattern: {
                  value: /^[0-9]+$/,
                  message: 'Please enter a number.',
                },
                min: {
                  value: minStorageValue,
                  message: `Storage must be at least ${minStorageValue} GiB.`,
                },
              }
        }
        render={({ field, fieldState: { error } }) =>
          isManaged && resolvedDatabaseType === 'REDIS' ? (
            // Hidden field to preserve storage value for Redis managed, but it's not used by ElastiCache
            <input type="hidden" {...field} />
          ) : (
            <InputText
              dataTestId="input-memory-storage"
              name={field.name}
              label="Storage (GiB)"
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
            />
          )
        }
      />
      {displayStorageWarning && (
        <Callout.Root className="mt-3" color="yellow">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            Once triggered, the update will be managed by your cloud provider and applied during the configured
            maintenance window. Moreover, the operation might cause a service interruption.{' '}
            <ExternalLink
              className="mt-1"
              href="https://www.qovery.com/docs/configuration/database#applying-changes-to-a-managed-database"
            >
              Have a look at the documentation first
            </ExternalLink>
          </Callout.Text>
        </Callout.Root>
      )}
    </>
  )
}

export default DatabaseSettingsResources
