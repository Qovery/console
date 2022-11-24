import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  InputText,
  Slider,
  inputSizeUnitRules,
} from '@qovery/shared/ui'
import { convertCpuToVCpu } from '@qovery/shared/utils'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  database?: DatabaseEntity
  loading?: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, database } = props
  const { control, formState, watch } = useFormContext()

  const maxMemoryBySize = database?.maximum_memory

  if (!database) return null

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Resources</h2>
        <form onSubmit={onSubmit}>
          <p className="text-text-500 text-xs mb-3">Adapt the database's consumption accordingly</p>
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
