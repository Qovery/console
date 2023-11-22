import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea } from '@qovery/shared/ui'

export interface GeneralSettingProps {
  label?: string
}

export function GeneralSetting({ label = 'Name' }: GeneralSettingProps) {
  const { control } = useFormContext()

  return (
    <>
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label={label}
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <InputTextArea
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description (optional)"
          />
        )}
      />
    </>
  )
}

export default GeneralSetting
