import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { isJob } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { CLUSTER_SETTINGS_RESOURCES_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { BannerBox, BannerBoxEnum, BlockContent, InputText, Link, Slider, inputSizeUnitRules } from '@qovery/shared/ui'

export interface SettingResourcesProps {
  displayWarningCpu: boolean
  application?: ApplicationEntity
  minInstances?: number
  maxInstances?: number
  isDatabase?: boolean
  clusterId?: string
}

export function SettingResources(props: SettingResourcesProps) {
  const {
    displayWarningCpu,
    application,
    minInstances = 1,
    maxInstances = 50,
    isDatabase = false,
    clusterId = '',
  } = props
  const { control, watch } = useFormContext()
  const { organizationId = '' } = useParams()

  let maxMemoryBySize = application?.maximum_memory

  if (!application) {
    maxMemoryBySize = 8192
  }

  const watchInstances = watch('instances')

  return (
    <div>
      <p className="text-text-500 text-xs mb-3">Manage the application's resources and horizontal auto-scaling.</p>
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
        {application && (
          <p className="text-text-400 text-xs mt-3">
            Minimum value is 10 milli vCPU. Maximum value allowed based on the selected cluster instance type:{' '}
            {application?.maximum_cpu} mili vCPU.{' '}
            {clusterId && (
              <Link
                className="!text-xs"
                link={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
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
        {application && (
          <p className="text-text-400 text-xs mt-3">
            Minimum value is 10 MB. Maximum value allowed based on the selected cluster instance type:{' '}
            {application.maximum_memory} MB.{' '}
            {clusterId && (
              <Link
                className="!text-xs"
                link={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL}
                linkLabel="Edit node"
              />
            )}
          </p>
        )}
      </BlockContent>

      {!isJob(application) && watchInstances && (
        <BlockContent title="Instances">
          <p className="text-text-600 mb-3 font-medium">{`${watchInstances[0]} - ${watchInstances[1]}`}</p>
          <Controller
            name="instances"
            control={control}
            render={({ field }) => (
              <Slider min={minInstances} max={maxInstances} step={1} onChange={field.onChange} value={field.value} />
            )}
          />
          <p className="text-text-400 text-xs mt-3">
            {application?.instances?.items && (
              <span className="flex mb-1">
                Current consumption: {application.instances.items.length} instance
                {application.instances.items.length > 1 ? 's' : ''}
              </span>
            )}
            Application auto-scaling is based on real-time CPU consumption. When your app goes above 60% (default) of
            CPU consumption for 5 minutes, your app will be auto-scaled and more instances will be added.
          </p>
        </BlockContent>
      )}

      {isDatabase && (
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
                name={field.name}
                label="Size in GB"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        </BlockContent>
      )}
    </div>
  )
}

export default SettingResources
