import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface GeneralSettingProps {
  label?: string
  type?: string
}

export function GeneralSetting({ label = 'Name', type }: GeneralSettingProps) {
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
      {type && (
        <Controller
          name={type}
          control={control}
          render={({ field }) => (
            <InputText
              name={field.name}
              onChange={field.onChange}
              value={upperCaseFirstLetter(field.value)}
              label="Type"
              disabled
            />
          )}
        />
      )}
    </>
  )
}

export default GeneralSetting
