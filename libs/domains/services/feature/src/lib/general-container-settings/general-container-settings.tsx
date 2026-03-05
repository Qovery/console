import { type ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect } from '@qovery/shared/ui'
import { useContainerRegistries } from '../hooks/use-container-registries/use-container-registries'
import { ImageName } from './image-name'
import { ImageTag } from './image-tag'

export interface GeneralContainerSettingsProps {
  organizationId: string
  openContainerRegistryCreateEditModal: () => void
  isSetting?: boolean
}

export interface ContainerFormProps {
  registry?: string
  image_name?: string
  image_tag?: string
}

export function GeneralContainerSettings({
  organizationId,
  openContainerRegistryCreateEditModal,
  isSetting,
}: GeneralContainerSettingsProps) {
  const { control, watch } = useFormContext<ContainerFormProps>()
  const watchRegistry = watch('registry') ?? ''
  const watchImageName = watch('image_name')
  const watchImageTag = watch('image_tag')

  const { data: containerRegistries = [] } = useContainerRegistries({ organizationId })

  return (
    <>
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
            options={containerRegistries
              ?.filter((c) => !c.cluster)
              .map((registry) => ({
                value: registry.id,
                label: registry.name || '',
              }))}
            label="Registry"
            error={error?.message}
            menuListButton={{
              title: 'Select registry',
              label: 'New registry',
              onClick: () => openContainerRegistryCreateEditModal(),
            }}
            isSearchable
          />
        )}
      />
      {watchRegistry && (
        <ImageName
          control={control}
          organizationId={organizationId}
          containerRegistryId={watchRegistry}
          isSetting={isSetting}
        />
      )}
      {watchRegistry && watchImageName && (
        <ImageTag
          control={control}
          organizationId={organization.id}
          containerRegistryId={watchRegistry}
          imageName={watchImageName}
          imageTag={watchImageTag}
        />
      )}
    </>
  )
}

export default GeneralContainerSettings
