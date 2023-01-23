// import { Controller, useFormContext } from 'react-hook-form'
// import { ClusterGeneralData } from '@qovery/shared/interfaces'
// import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export interface ClusterCredentialsSettingsProps {
  fromDetail?: boolean
}

export function ClusterCredentialsSettings(props: ClusterCredentialsSettingsProps) {
  // const { fromDetail } = props
  // const { control } = useFormContext<ClusterGeneralData>()

  return (
    <div>
      hello
      {/* <Controller
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
      /> */}
    </div>
  )
}

export default ClusterCredentialsSettings
