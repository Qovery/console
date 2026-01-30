import { Controller, useFormContext } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { InputSelect } from '@qovery/shared/ui'

export interface SettingsResourcesInstanceTypesProps {
  databaseInstanceTypes?: Value[]
  displayWarning?: boolean
}

export function SettingsResourcesInstanceTypes({
  databaseInstanceTypes = [],
  displayWarning,
}: SettingsResourcesInstanceTypesProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name="instance_type"
      control={control}
      rules={{
        required: 'Please select an instance type',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          isSearchable
          onChange={field.onChange}
          value={field.value}
          label="Instance type"
          error={error?.message}
          options={databaseInstanceTypes}
          hint="The chosen instance type has a direct impact on your cloud provider cost."
        />
      )}
    />
  )
}

export default SettingsResourcesInstanceTypes
