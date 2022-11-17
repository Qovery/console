import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemorySizeEnum } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Icon,
  IconAwesomeEnum,
  InputSizeUnit,
  InputText,
  Slider,
  WarningBox,
  WarningBoxEnum,
  inputSizeUnitRules,
} from '@qovery/shared/ui'
import { convertCpuToVCpu } from '@qovery/shared/utils'

export interface SettingResourcesProps {
  getMemoryUnit: (value: string | MemorySizeEnum) => string
  memorySize: MemorySizeEnum | string
  displayWarningCpu: boolean
  application?: ApplicationEntity
  minInstances?: number
  maxInstances?: number
  isDatabase?: boolean

  getStorageUnit?: (value: string | MemorySizeEnum) => string
  storageSize?: MemorySizeEnum | string
}

export function SettingResources(props: SettingResourcesProps) {
  const {
    getMemoryUnit,
    memorySize,
    displayWarningCpu,
    application,
    minInstances = 1,
    maxInstances = 50,
    isDatabase = false,
    getStorageUnit,
    storageSize,
  } = props
  const { control, watch, trigger } = useFormContext()

  let maxMemoryBySize =
    memorySize === MemorySizeEnum.GB ? (application?.maximum_memory || 0) / 1024 : application?.maximum_memory || 0

  if (!application) {
    maxMemoryBySize = memorySize === MemorySizeEnum.GB ? 8192 / 1024 : 8192
  }

  const watchInstances = watch('instances')

  // fix a bug where the validation of the memory field is done with the old maximum value but display the new one
  // in the message error. Comment the useEffect to see the bug in action.
  useEffect(() => {
    setTimeout(() => {
      // trigger && trigger is here to solve testing with the CI that goes in an infinite loop but not in local
      trigger && trigger('memory').then()
    })
  }, [memorySize, trigger])

  return (
    <div>
      <p className="text-text-500 text-xs mb-3">
        Adapt the {isDatabase ? 'database' : 'application'}'s consumption accordingly
      </p>
      <BlockContent title="vCPU">
        <p className="flex items-center text-text-600 mb-3 font-medium">
          {displayWarningCpu && (
            <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} className="mr-1.5 text-error-500 text-sm" />
          )}
          {watch('cpu')}
        </p>
        <Controller
          name="cpu"
          control={control}
          render={({ field }) => <Slider min={0} max={20} step={0.25} onChange={field.onChange} value={field.value} />}
        />
        {application && (
          <p className="text-text-400 text-xs mt-3">
            Max consumption by node accordingly to your cluster: {convertCpuToVCpu(application?.maximum_cpu)} vCPU
          </p>
        )}
        {displayWarningCpu && (
          <WarningBox
            dataTestId="warning-box"
            className="mt-3"
            title="Not enough resources"
            message="Increase the capacity of your cluster nodes or reduce the service consumption."
            type={WarningBoxEnum.ERROR}
          />
        )}
      </BlockContent>
      <BlockContent title="Memory">
        <Controller
          name="memory"
          control={control}
          rules={inputSizeUnitRules(maxMemoryBySize)}
          render={({ field, fieldState: { error } }) => (
            <InputSizeUnit
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              maxSize={maxMemoryBySize}
              error={error}
              currentSize={application?.memory}
              currentUnit={memorySize}
              getUnit={getMemoryUnit}
              showConsumption={!!application}
            />
          )}
        />
      </BlockContent>

      {watchInstances && (
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

      {isDatabase && getStorageUnit && storageSize && (
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
              <InputText name="storage" label="Size in GB" value={field.value} onChange={field.onChange} />
            )}
          />
        </BlockContent>
      )}
    </div>
  )
}

export default SettingResources
