import { Controller, useFormContext } from 'react-hook-form'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { InputText } from '@qovery/shared/ui'

export function BuildSettings() {
  const { control } = useFormContext<ApplicationGeneralData>()

  return (
    <>
      <Controller
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
      <Controller
        name="docker_target_build_stage"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputText
            label="Dockerfile stage (optional)"
            name={field.name}
            onChange={field.onChange}
            value={field.value || undefined}
            error={error?.message}
            hint="Specify the target stage to build in a multi-stage Dockerfile"
          />
        )}
      />
    </>
  )
}

export default BuildSettings
