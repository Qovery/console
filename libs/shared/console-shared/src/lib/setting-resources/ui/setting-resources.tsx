import { Controller, useFormContext } from 'react-hook-form'
import { isJob } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Icon,
  IconAwesomeEnum,
  InputText,
  Slider,
  WarningBox,
  WarningBoxEnum,
  inputSizeUnitRules,
} from '@qovery/shared/ui'
import { convertCpuToVCpu } from '@qovery/shared/utils'

export interface SettingResourcesProps {
  displayWarningCpu: boolean
  application?: ApplicationEntity
  minInstances?: number
  maxInstances?: number
  isDatabase?: boolean
}

export function SettingResources(props: SettingResourcesProps) {
  const { displayWarningCpu, application, minInstances = 1, maxInstances = 50, isDatabase = false } = props
  const { control, watch } = useFormContext()

  let maxMemoryBySize = application?.maximum_memory

  if (!application) {
    maxMemoryBySize = 8192
  }

  const watchInstances = watch('instances')

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
