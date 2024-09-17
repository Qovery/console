import { Controller, useFormContext } from 'react-hook-form'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { InputText } from '@qovery/shared/ui'

export function BuildSettings() {
  const { control } = useFormContext<ApplicationGeneralData>()

  return (
    <Controller
      data-testid="input-text-dockerfile-path"
      key="dockerfile_path"
      name="dockerfile_path"
      defaultValue="Dockerfile"
      control={control}
      rules={{
        required: 'Value required',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputText
          dataTestId="input-text-dockerfile"
          name={field.name}
          onChange={field.onChange}
          value={field.value ?? ''}
          label="Dockerfile path"
          error={error?.message}
        />
      )}
    />
  )
}

export default BuildSettings
