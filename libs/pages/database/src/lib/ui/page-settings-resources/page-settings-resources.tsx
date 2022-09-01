import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemorySizeEnum } from '@console/shared/enums'
import { DatabaseEntity } from '@console/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  InputSelect,
  InputText,
  Slider,
} from '@console/shared/ui'
import { convertCpuToVCpu } from '@console/shared/utils'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  handleChangeMemoryUnit: () => void
  memorySize: MemorySizeEnum
  database?: DatabaseEntity
  loading?: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, handleChangeMemoryUnit, database, memorySize } = props
  const { control, formState } = useFormContext()

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  const maxMemoryBySize =
    memorySize === MemorySizeEnum.GB ? (database?.maximum_memory || 0) / 1024 : database?.maximum_memory || 0

  if (!database) return null

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Resources</h2>
        <form onSubmit={onSubmit}>
          <p className="text-text-500 text-xs mb-3">Adapt the application's consumption accordingly</p>
          <BlockContent title="vCPU">
            <Controller
              name="cpu"
              control={control}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={convertCpuToVCpu(database?.maximum_cpu)}
                  step={0.25}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            <p className="text-text-400 text-xs mt-3">
              Max consumption by node accordingly to your cluster: {convertCpuToVCpu(database?.maximum_cpu)} vCPU
            </p>
          </BlockContent>
          <BlockContent title="RAM" key={`memory-${memorySize}`}>
            <div className="flex w-full gap-3">
              <div className="w-full">
                <Controller
                  name="memory"
                  control={control}
                  rules={{
                    required: 'Please enter a size.',
                    validate: (value: number) => value <= maxMemoryBySize,
                    max: maxMemoryBySize,
                    pattern: pattern,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      dataTestId="input-memory"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      label="Size"
                      error={
                        error?.type === 'required'
                          ? 'Please enter a size.'
                          : error?.type === 'max'
                          ? `Maximum allowed memory is: ${maxMemoryBySize} ${memorySize}.`
                          : undefined
                      }
                    />
                  )}
                />
                <p data-testid="current-consumption" className="text-text-400 text-xs mt-1 ml-4">
                  Current consumption:{' '}
                  {database?.memory &&
                    `${
                      database?.memory < 1024
                        ? database?.memory + ` ${MemorySizeEnum.MB}`
                        : database?.memory / 1024 + ` ${MemorySizeEnum.GB}`
                    }`}
                </p>
              </div>
              <InputSelect
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
