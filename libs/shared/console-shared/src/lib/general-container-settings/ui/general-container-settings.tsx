import { Controller, useFormContext } from 'react-hook-form'
import { useContainerRegistries } from '@qovery/domains/organizations/feature'
import { type OrganizationEntity } from '@qovery/shared/interfaces'
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
  const { data: containerRegistries = [] } = useContainerRegistries({ organizationId: organization?.id ?? '' })

  return (
    <div className={twMerge('mb-6 flex flex-col gap-3', className)}>
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
            />
          )}
        />
        <p className="text-right">
          <Link to={SETTINGS_URL(organization?.id) + SETTINGS_CONTAINER_REGISTRIES_URL} className="text-ssm">
            Don't see your registry?
          </Link>
        </p>
      </div>
      <div>
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
      </div>
      <div>
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
        <p className="text-xs ml-4 mt-1 text-neutral-350">Image tag shall be unique (no ‘main’, ‘dev’, ‘master’)</p>
      </div>
    </div>
  )
}

export default GeneralContainerSettings
