import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type OrganizationEntity, type Value } from '@qovery/shared/interfaces'
import { SETTINGS_CONTAINER_REGISTRIES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { InputSelect, InputText, Link } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface GeneralContainerSettingsProps {
  organization?: OrganizationEntity
  className?: string
}

export function GeneralContainerSettings({ organization, className }: GeneralContainerSettingsProps) {
  const { control } = useFormContext<{
    registry?: string
    image_name?: string
    image_tag?: string
  }>()
  const [availableRegistiesOptions, setAvailableRegistiesOptions] = useState<Value[]>([])

  useEffect(() => {
    if (organization?.containerRegistries?.items && organization.containerRegistries.items.length > 0) {
      setAvailableRegistiesOptions(
        organization.containerRegistries.items.map((registry) => ({
          value: registry.id,
          label: registry.name || '',
        }))
      )
    }
  }, [organization])

  return (
    <div className={twMerge('mb-6 flex flex-col gap-3', className)}>
      <Controller
        name="registry"
        control={control}
        rules={{
          required: 'Please select a registry.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-registry"
            className="mb-0.5"
            onChange={field.onChange}
            value={field.value}
            options={availableRegistiesOptions}
            label="Registry"
            error={error?.message}
          />
        )}
      />
      <p className="text-right">
        <Link to={SETTINGS_URL(organization?.id) + SETTINGS_CONTAINER_REGISTRIES_URL} className="text-ssm">
          Don't see your registry?
        </Link>
      </p>
      <Controller
        name="image_name"
        control={control}
        rules={{
          required: 'Please type a value.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-text-image-name"
            name="image_name"
            onChange={field.onChange}
            value={field.value}
            label="Image name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="image_tag"
        control={control}
        rules={{
          required: 'Please type a value.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-text-image-tag"
            name="image_tag"
            onChange={field.onChange}
            value={field.value}
            label="Image tag"
            error={error?.message}
          />
        )}
      />
    </div>
  )
}

export default GeneralContainerSettings
