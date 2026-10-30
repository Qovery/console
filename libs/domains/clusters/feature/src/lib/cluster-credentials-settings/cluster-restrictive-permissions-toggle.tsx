import { Controller, useFormContext } from 'react-hook-form'
import { InputToggle } from '@qovery/shared/ui'

export function ClusterRestrictivePermissionsToggle() {
  const { control } = useFormContext()

  return (
    <Controller
      name="using_restrictive_permissions"
      control={control}
      render={({ field }) => (
        <InputToggle
          dataTestId="input-restrictive-permissions-toggle"
          value={Boolean(field.value)}
          onChange={field.onChange}
          title="Use restrictive permissions"
          description="Qovery uses restricted credentials for day-to-day operations and extended credentials only when wider access is required. Action is required in your AWS account when extended credentials need to be used."
          align="top"
          small
        />
      )}
    />
  )
}

export default ClusterRestrictivePermissionsToggle
