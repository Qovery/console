import { type DatabaseTypeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type Database } from '@qovery/domains/services/data-access'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Callout,
  ExternalLink,
  Icon,
  IconAwesomeEnum,
  InputText,
  Link,
  inputSizeUnitRules,
} from '@qovery/shared/ui'
import SettingsResourcesInstanceTypesFeature from '../../feature/settings-resources-instance-types-feature/setting-resources-instance-types-feature'

export interface DatabaseSettingsResourcesProps {
  database?: Database
  isDatabase?: boolean
  isManaged?: boolean
  clusterId?: string
  databaseType?: DatabaseTypeEnum
  displayInstanceTypesWarning?: boolean
  displayStorageWarning?: boolean
}

export function DatabaseSettingsResources({
  database,
  databaseType,
  isManaged = false,
  clusterId = '',
  displayInstanceTypesWarning = false,
  displayStorageWarning = false,
}: DatabaseSettingsResourcesProps) {
  const { control } = useFormContext()
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

  return (
    <div>
      {!isManaged && (
        <>
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
            <p className="text-neutral-350 text-xs mt-3">
              Minimum value is {minVCpu} milli vCPU.{' '}
              {database && (
                <>
                  Maximum value allowed based on the selected cluster instance type: {database?.maximum_cpu} milli vCPU.{' '}
                  {clusterId && (
                    <Link
                      to={
                        CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL
                      }
                      size="xs"
                    >
                      Edit node
                    </Link>
                  )}
                </>
              )}
            </p>
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

            <p className="text-neutral-350 text-xs mt-3">
              Minimum value is {minMemory} MiB.{' '}
              {database && (
                <>
                  Maximum value allowed based on the selected cluster instance type: {database?.maximum_memory} MiB.{' '}
                  {clusterId && (
                    <Link
                      to={
                        CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL
                      }
                      size="xs"
                    >
                      Edit node
                    </Link>
                  )}
                </>
              )}
            </p>
          </BlockContent>
        </>
      )}
      {isManaged && databaseType && (
        <SettingsResourcesInstanceTypesFeature
          databaseType={databaseType}
          displayWarning={displayInstanceTypesWarning}
        />
      )}
      <BlockContent title="Storage">
        <Controller
          name="storage"
          control={control}
          rules={{
            pattern: {
              value: /^[0-9]+$/,
              message: 'Please enter a number.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-memory-storage"
              name={field.name}
              label="Size in GiB"
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
            />
          )}
        />
        {displayStorageWarning && (
          <Callout.Root className="mt-3" color="yellow">
            <Callout.Icon>
              <Icon iconName="circle-info" />
            </Callout.Icon>
            <Callout.Text className="text-xs text-neutral-350">
              Once triggered, the update will be managed by your cloud provider and applied during the configured
              maintenance window. Moreover, the operation might cause a service interruption.{' '}
              <ExternalLink
                className="mt-1"
                href="https://hub.qovery.com/docs/using-qovery/configuration/database/#applying-changes-to-a-managed-database"
                size="xs"
              >
                Have a look at the documentation first
              </ExternalLink>
            </Callout.Text>
          </Callout.Root>
        )}
      </BlockContent>
    </div>
  )
}

export default DatabaseSettingsResources
