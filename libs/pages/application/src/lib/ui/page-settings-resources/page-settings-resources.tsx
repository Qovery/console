import { Controller, useFormContext } from 'react-hook-form'
import { MemorySizeEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, InputSelect, InputText, Slider } from '@console/shared/ui'
import { convertCpuToVCpu } from '@console/shared/utils'

export interface PageSettingsResourcesProps {
  onSubmit: () => void
  handleChangeMemoryUnit: () => void
  memorySize: MemorySizeEnum
  application?: ApplicationEntity
  loading?: boolean
  memory?: number
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, memory, handleChangeMemoryUnit, application, memorySize } = props
  const { control, formState, watch } = useFormContext()

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Resources</h2>
        <form onSubmit={onSubmit}>
          <p className="text-text-500 text-xs mb-3">Adapt the application's consumption accordingly</p>
          <BlockContent title="vCPU">
            <p className="text-text-600 mb-3 font-medium">{watch('cpu')}</p>
            <Controller
              name="cpu"
              control={control}
              render={({ field }) => (
                <Slider
                  dataTestId="input-cpu"
                  min={0}
                  max={convertCpuToVCpu(application?.maximum_cpu)}
                  step={0.25}
                  onChange={field.onChange}
                  defaultValue={field.value}
                />
              )}
            />
            <p className="text-text-400 text-xs mt-3">
              Max consumption by node accordingly to your cluster: {convertCpuToVCpu(application?.maximum_cpu)} vCPU
            </p>
          </BlockContent>
          <BlockContent title="RAM">
            <div className="flex w-full gap-3">
              <div className="w-full">
                <Controller
                  name="memory"
                  control={control}
                  rules={{ required: 'Please enter a size.', pattern: pattern }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      dataTestId="input-size"
                      type="number"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      label="Size"
                      error={error?.message}
                    />
                  )}
                />
                <p className="text-text-400 text-xs mt-1">
                  Current consumption:{' '}
                  {memory &&
                    `${memory < 1024 ? memory + ` ${MemorySizeEnum.MB}` : memory / 1024 + ` ${MemorySizeEnum.GB}`}`}
                </p>
              </div>
              <InputSelect
                dataTestId="input-memory-unit"
                className="w-full h-full"
                onChange={handleChangeMemoryUnit}
                items={Object.values(MemorySizeEnum).map((size) => ({
                  label: size,
                  value: size,
                }))}
                value={memorySize}
                label="Unit"
              />
            </div>
          </BlockContent>
          <BlockContent title="Instances">
            <p className="text-text-600 mb-3 font-medium">
              {watch('instances') && watch('instances')[0] - watch('instances')[1]}
            </p>
            <Controller
              name="instances"
              control={control}
              render={({ field }) => (
                <Slider
                  dataTestId="input-instances"
                  min={0}
                  max={50}
                  step={1}
                  onChange={field.onChange}
                  defaultValue={field.value}
                />
              )}
            />
            <p className="text-text-400 text-xs mt-3">
              Application auto-scaling is based on real-time CPU consumption. When your app goes above 60% (default) of
              CPU consumption for 5 minutes, your app will be auto-scaled and more instances will be added.
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
    </div>
  )
}

export default PageSettingsResources
