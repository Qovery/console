import { Controller, useFormContext } from 'react-hook-form'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export function ClusterGeneralSettings() {
  const { control } = useFormContext<ClusterGeneralData>()

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
            dataTestId="input-name"
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
            dataTestId="input-description"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
          />
        )}
      />
      <Controller
        name="production"
        control={control}
        render={({ field }) => (
          <div className="rounded border border-element-light-lighter-400 p-4 mb-3">
            <InputToggle
              dataTestId="input-production-toggle"
              value={field.value}
              onChange={field.onChange}
              title="Production cluster"
              description="Actions on productions clusters will be more restricted"
              small
            />
          </div>
        )}
      />
    </div>
  )
}

export default ClusterGeneralSettings
