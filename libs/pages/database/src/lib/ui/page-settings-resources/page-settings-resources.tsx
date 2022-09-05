import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemorySizeEnum } from '@console/shared/enums'
import { DatabaseEntity } from '@console/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, InputSizeUnit, Slider } from '@console/shared/ui'
import { convertCpuToVCpu } from '@console/shared/utils'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  storageSize: MemorySizeEnum | string
  memorySize: MemorySizeEnum | string
  getMemoryUnit: (value: string | MemorySizeEnum) => void
  getStorageUnit: (value: string | MemorySizeEnum) => void
  database?: DatabaseEntity
  loading?: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, database, memorySize, getMemoryUnit, storageSize, getStorageUnit } = props
  const { control, formState, watch } = useFormContext()

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
            <p className="flex items-center text-text-600 mb-3 font-medium">{watch('cpu')}</p>
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
          <BlockContent title="RAM">
            <InputSizeUnit
              name="memory"
              maxSize={maxMemoryBySize}
              currentSize={database?.memory}
              currentUnit={memorySize}
              getUnit={getMemoryUnit}
            />
          </BlockContent>
          <BlockContent title="Storage">
            <InputSizeUnit
              name="storage"
              currentSize={database?.storage}
              currentUnit={storageSize}
              getUnit={getStorageUnit}
            />
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
