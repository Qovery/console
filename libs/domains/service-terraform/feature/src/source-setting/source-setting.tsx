import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect } from '@qovery/shared/ui'

export function SourceSetting() {
  const { control, resetField } = useFormContext()

  return (
    <div className="flex flex-col gap-3">
      <Controller
        name="source_provider"
        control={control}
        rules={{
          required: 'Please select a Terraform source.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            label="Terraform source"
            disabled={true}
            options={[
              {
                label: 'Git provider',
                value: 'GIT',
              },
            ]}
            onChange={(value) => {
              resetField('repository')
              field.onChange(value)
            }}
            value={field.value}
            error={error?.message}
          />
        )}
      />
    </div>
  )
}

export default SourceSetting
