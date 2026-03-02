import { type DatabaseTypeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type Database } from '@qovery/domains/services/data-access'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Callout, ExternalLink, Icon, InputText, Link, inputSizeUnitRules } from '@qovery/shared/ui'
import SettingsResourcesInstanceTypesFeature from '../../feature/settings-resources-instance-types-feature/setting-resources-instance-types-feature'

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
  const { organizationId = '', environmentId } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  const maxMemoryBySize = database?.maximum_memory
  const cloudProvider = environment?.cloud_provider.provider

  if (database) {
    databaseType = database.type
  }

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
                            to={
                              CLUSTER_URL(organizationId, clusterId) +
                              CLUSTER_SETTINGS_URL +
                              CLUSTER_SETTINGS_RESOURCES_URL
                            }
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
                            to={
                              CLUSTER_URL(organizationId, clusterId) +
                              CLUSTER_SETTINGS_URL +
                              CLUSTER_SETTINGS_RESOURCES_URL
                            }
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
      {isManaged && databaseType && (
        <SettingsResourcesInstanceTypesFeature
          databaseType={databaseType}
          displayWarning={displayInstanceTypesWarning}
          isSetting={isSetting}
        />
      )}
      {/* Storage is not configurable for Redis managed databases (ElastiCache) - capacity is determined by node type */}
      <Controller
        name="storage"
        control={control}
        rules={
          isManaged && databaseType === 'REDIS'
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
          isManaged && databaseType === 'REDIS' ? (
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
          <Callout.Text className="text-neutral-350">
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
