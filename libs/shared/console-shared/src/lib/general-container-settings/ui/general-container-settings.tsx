import { type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { ContainerRegistryCreateEditModal, useContainerRegistries } from '@qovery/domains/organizations/feature'
import { SETTINGS_CONTAINER_REGISTRIES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { InputSelect, Link, useModal } from '@qovery/shared/ui'
import ImageName from './image-name'
import { ImageTag } from './image-tag'

export interface GeneralContainerSettingsProps {
  organization?: Organization
  isSetting?: boolean
}

export interface ContainerFormProps {
  registry?: string
  image_name?: string
  image_tag?: string
}

export function GeneralContainerSettings({ organization, isSetting }: GeneralContainerSettingsProps) {
  const { control, watch } = useFormContext<ContainerFormProps>()
  const { openModal, closeModal } = useModal()
  const watchRegistry = watch('registry')
  const watchImageName = watch('image_name')
  const watchImageTag = watch('image_tag')

  const { data: containerRegistries = [] } = useContainerRegistries({ organizationId: organization?.id ?? '' })

  return (
    <>
      <div>
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
                onClick: () => {
                  openModal({
                    content: organization && (
                      <ContainerRegistryCreateEditModal
                        organizationId={organization.id}
                        onClose={(response) => {
                          response && field.onChange(response.id)
                          closeModal()
                        }}
                      />
                    ),
                    options: {
                      fakeModal: true,
                    },
                  })
                },
              }}
              isSearchable
            />
          )}
        />
        <p className="text-right">
          <Link to={SETTINGS_URL(organization?.id) + SETTINGS_CONTAINER_REGISTRIES_URL} className="text-ssm">
            Don't see your registry?
          </Link>
        </p>
      </div>
      {organization && watchRegistry && (
        <ImageName
          control={control}
          organizationId={organization.id}
          containerRegistryId={watchRegistry}
          isSetting={isSetting}
        />
      )}
      {organization && watchRegistry && watchImageName && (
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
