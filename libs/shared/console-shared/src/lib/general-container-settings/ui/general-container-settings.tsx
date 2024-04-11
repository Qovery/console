import { type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { ContainerRegistryCreateEditModal, useContainerRegistries } from '@qovery/domains/organizations/feature'
import { SETTINGS_CONTAINER_REGISTRIES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { InputSelect, InputText, Link, useModal } from '@qovery/shared/ui'

export interface GeneralContainerSettingsProps {
  organization?: Organization
}

export function GeneralContainerSettings({ organization }: GeneralContainerSettingsProps) {
  const { control } = useFormContext<{
    registry?: string
    image_name?: string
    image_tag?: string
  }>()
  const { openModal, closeModal } = useModal()
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
              options={containerRegistries?.map((registry) => ({
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
            hint="Image tag shall be unique (no ‘main’, ‘dev’, ‘master’)"
            error={error?.message}
          />
        )}
      />
    </>
  )
}

export default GeneralContainerSettings
