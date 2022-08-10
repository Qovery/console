import { Controller, useFormContext } from 'react-hook-form'
import { BlockContent, Button, InputText } from '@console/shared/ui'

export interface PageSettingsGeneralProps {
  onSubmit: () => void
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { onSubmit } = props

  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <form onSubmit={onSubmit}>
          <BlockContent title="General">
            <Controller
              name="auto_preview"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-6"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Application name"
                  error={error?.message}
                />
              )}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button className="btn--no-min-w" type="submit" disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PageSettingsGeneral
