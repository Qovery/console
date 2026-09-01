import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { InputSelect, InputText } from '@qovery/shared/ui'

interface SecretManagerIntegrationFieldsProps {
  methods: UseFormReturn<SecretManagerAccess>
}

export function SecretManagerIdField({ methods }: SecretManagerIntegrationFieldsProps) {
  return (
    <Controller
      name="id"
      control={methods.control}
      render={({ field, fieldState: { error } }) => (
        <InputText
          label="Qovery ID"
          name={field.name}
          value={field.value}
          error={error?.message}
          disabled
          hint="This is the ID to be used to interact with Qovery via the API, CLI or Terraform"
        />
      )}
    />
  )
}

export function SecretManagerNameField({ methods }: SecretManagerIntegrationFieldsProps) {
  return (
    <Controller
      name="name"
      control={methods.control}
      rules={{
        required: 'Please enter a secret manager name.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputText
          name={field.name}
          label="Secret manager name"
          value={field.value}
          onChange={field.onChange}
          hint="Display name in Qovery"
          error={error?.message}
        />
      )}
    />
  )
}

interface SecretManagerRegionFieldProps extends SecretManagerIntegrationFieldsProps {
  regions: Value[]
  onRegionChange?: ((region: string) => void) | undefined
}

export function SecretManagerRegionField({ methods, regions, onRegionChange }: SecretManagerRegionFieldProps) {
  return (
    <Controller
      name="endpoint.region"
      control={methods.control}
      rules={{
        required: 'Please select a region.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          label="Region"
          value={field.value}
          placeholder="Select a region"
          onChange={(value) => {
            const region = value as string
            field.onChange(region)
            onRegionChange?.(region)
          }}
          options={regions}
          error={error?.message}
          isSearchable
          portal
        />
      )}
    />
  )
}

export function GcpProjectIdField({ methods }: SecretManagerIntegrationFieldsProps) {
  return (
    <Controller
      name="endpoint.project_id"
      control={methods.control}
      rules={{
        required: 'Please enter your GCP Project ID.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputText
          name={field.name}
          label="GCP Project ID"
          value={field.value}
          onChange={field.onChange}
          error={error?.message}
        />
      )}
    />
  )
}
