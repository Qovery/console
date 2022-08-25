import { Controller, useFormContext } from 'react-hook-form'
import { BlockContent, Button, ButtonSize, ButtonStyle, InputSelect, InputText } from '@console/shared/ui'
import { memorySizeValues } from '@console/shared/utils'

export interface PageSettingsResourcesProps {
  onSubmit: () => void
  handleChangeMemoryUnit: () => void
  loading?: boolean
  memory?: number
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, memory, handleChangeMemoryUnit } = props
  const { control, formState } = useFormContext()

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Resources</h2>
        <form onSubmit={onSubmit}>
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
                  Current consumption: {memory && `${memory < 1024 ? memory + ' MB' : memory / 1024 + ' GB'}`}
                </p>
              </div>
              <Controller
                name="memory_size"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    dataTestId="input-memory-unit"
                    className="w-full h-full"
                    onChange={() => {
                      field.onChange()
                      handleChangeMemoryUnit()
                    }}
                    items={memorySizeValues}
                    value={field.value}
                    label="Unit"
                    error={error?.message}
                  />
                )}
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
    </div>
  )
}

export default PageSettingsResources
