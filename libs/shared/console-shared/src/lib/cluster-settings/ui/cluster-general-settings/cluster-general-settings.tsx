import { Controller, useFormContext } from 'react-hook-form'
import { ApplicationGeneralData } from '@qovery/shared/interfaces'
import { InputText, InputTextArea } from '@qovery/shared/ui'

export function ClusterGeneralSettings() {
  const { control } = useFormContext<ApplicationGeneralData>()

  return (
    <div>
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
            label="Cluster name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <InputTextArea
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
          />
        )}
      />
    </div>
  )
}

export default ClusterGeneralSettings
