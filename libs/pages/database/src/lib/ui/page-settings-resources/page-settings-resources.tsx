import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { SettingsResourcesInstanceTypesFeature } from '@qovery/shared/console-shared'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import {
  BannerBox,
  BannerBoxEnum,
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  InputText,
  Link,
  inputSizeUnitRules,
} from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  database?: DatabaseEntity
  loading?: boolean
  clusterId?: string
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, database, clusterId } = props
  const { control, formState } = useFormContext()
  const { organizationId = '' } = useParams()

  const maxMemoryBySize = database?.maximum_memory

  if (!database) return null

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Resources</h2>
        <form onSubmit={onSubmit}>
          <p className="text-text-500 text-xs mb-3">Manage the database's resources</p>

          {database.mode === DatabaseModeEnum.MANAGED && (
            <BannerBox
              className="mb-5"
              title="Qovery manages this resource for you"
              message={
                <span>
                  Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                  <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                  drift in the configuration.
                </span>
              }
              type={BannerBoxEnum.WARNING}
            />
          )}

          {database.mode !== DatabaseModeEnum.MANAGED && (
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
                    {database.maximum_memory} MB.{' '}
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

          {database.instance_type && <SettingsResourcesInstanceTypesFeature databaseType={database.type} />}

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
                  type="number"
                  name={field.name}
                  dataTestId="input-memory-storage"
                  label="Size in GB"
                  value={field.value}
                  onChange={field.onChange}
                  error={error?.message}
                />
              )}
            />
            <p data-testid="current-consumption" className="text-text-400 text-xs mt-1 ml-4">
              Current consumption: {database.storage} GB
            </p>
          </BlockContent>
          <div className="flex justify-end">
            <Button
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#resources',
            linkLabel: 'How to configure my database',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsResources
