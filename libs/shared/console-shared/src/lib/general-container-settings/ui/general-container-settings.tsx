import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { OrganizationEntity, Value } from '@qovery/shared/interfaces'
import { SETTINGS_CONTAINER_REGISTRIES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { InputSelect, InputText, Link } from '@qovery/shared/ui'

export interface GeneralContainerSettingsProps {
  organization?: OrganizationEntity
  className?: string
}

export function GeneralContainerSettings(props: GeneralContainerSettingsProps) {
  const { organization, className = 'mb-6' } = props
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
    <div className={className}>
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
      <p className="mb-3  text-right">
        <Link
          className="font-medium text-ssm"
          link={`${SETTINGS_URL(organization?.id)}${SETTINGS_CONTAINER_REGISTRIES_URL}`}
          linkLabel="Don't see your registry?"
          iconRight="icon-solid-arrow-up-right-from-square"
        />
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
            className="mb-3"
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
            className="mb-3"
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
