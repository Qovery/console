import { DatabaseTypeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { BannerBox, BannerBoxEnum, BlockContent, InputText, Link, inputSizeUnitRules } from '@qovery/shared/ui'
import SettingsResourcesInstanceTypesFeature from '../../feature/settings-resources-instance-types-feature/setting-resources-instance-types-feature'

export interface DatabaseSettingsResourcesProps {
  database?: DatabaseEntity
  minInstances?: number
  maxInstances?: number
  isDatabase?: boolean
  isManaged?: boolean
  clusterId?: string
  databaseType?: DatabaseTypeEnum
  displayWarningCpu?: boolean
}

export function DatabaseSettingsResources({
  database,
  displayWarningCpu,
  databaseType,
  isManaged = false,
  clusterId = '',
}: DatabaseSettingsResourcesProps) {
  const { control } = useFormContext()
  const { organizationId = '' } = useParams()

  const maxMemoryBySize = database?.maximum_memory

  if (database) {
    databaseType = database.type
  }

  return (
    <div>
      {!isManaged && (
        <>
          <BlockContent title="vCPU">
            <Controller
              name="cpu"
              control={control}
              render={({ field }) => (
                <InputText
                  type="number"
                  name={field.name}
                  label="Size (in milli vCPU)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {database && (
              <p className="text-text-400 text-xs mt-3">
                Minimum value is 10 milli vCPU. Maximum value allowed based on the selected cluster instance type:{' '}
                {database?.maximum_cpu} mili vCPU.{' '}
                {clusterId && (
                  <Link
                    className="!text-xs"
                    link={
                      CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL
                    }
                    linkLabel="Edit node"
                  />
                )}
              </p>
            )}
            {displayWarningCpu && (
              <BannerBox
                dataTestId="banner-box"
                className="mt-3"
                title="Not enough resources"
                message="Increase the capacity of your cluster nodes or reduce the service consumption."
                type={BannerBoxEnum.ERROR}
              />
            )}
          </BlockContent>
          <BlockContent title="Memory">
            <Controller
              name="memory"
              control={control}
              rules={inputSizeUnitRules(maxMemoryBySize)}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-memory-memory"
                  type="number"
                  name={field.name}
                  label="Size in MB"
                  value={field.value}
                  onChange={field.onChange}
                  error={
                    error?.type === 'required'
                      ? 'Please enter a size.'
                      : error?.type === 'max'
                      ? `Maximum allowed ${field.name} is: ${maxMemoryBySize} MB.`
                      : undefined
                  }
                />
              )}
            />
            {database && (
              <p className="text-text-400 text-xs mt-3">
                Minimum value is 1 MB. Maximum value allowed based on the selected cluster instance type:{' '}
                {database?.maximum_memory} MB.{' '}
                {clusterId && (
                  <Link
                    className="!text-xs"
                    link={
                      CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL
                    }
                    linkLabel="Edit node"
                  />
                )}
              </p>
            )}
          </BlockContent>
        </>
      )}
      {isManaged && databaseType && <SettingsResourcesInstanceTypesFeature databaseType={databaseType} />}
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
              label="Size in GB"
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
            />
          )}
        />
      </BlockContent>
    </div>
  )
}

export default DatabaseSettingsResources
