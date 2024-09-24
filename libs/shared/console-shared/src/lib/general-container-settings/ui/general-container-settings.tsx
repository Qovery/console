import { type Organization } from 'qovery-typescript-axios'
import { type Control, Controller, useFormContext } from 'react-hook-form'
import {
  ContainerRegistryCreateEditModal,
  useContainerRegistries,
  useContainerVersions,
} from '@qovery/domains/organizations/feature'
import { type Value } from '@qovery/shared/interfaces'
import { SETTINGS_CONTAINER_REGISTRIES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Icon, InputSelect, InputText, Link, LoaderSpinner, Tooltip, useModal } from '@qovery/shared/ui'

export interface GeneralContainerSettingsProps {
  organization?: Organization
}

function ImageTag({
  control,
  organizationId,
  containerRegistryId,
  imageName,
  imageTag,
}: {
  control: Control<{ image_tag?: string }>
  organizationId: string
  containerRegistryId: string
  imageName: string
  imageTag?: string
}) {
  const { data: containerVersions = [], isFetching } = useContainerVersions({
    organizationId,
    containerRegistryId,
    imageName,
  })

  const options =
    containerVersions
      .find(({ image_name }) => image_name === imageName)
      ?.versions?.map<Value>((version) => ({
        value: version,
        label:
          version === 'latest' ? (
            <span className="flex items-center gap-3">
              <span>{version}</span>
              <Tooltip classNameContent="z-10" content="Image tag cannot be latest to ensure consistent deployment">
                <span>
                  <Icon iconName="circle-info" iconStyle="regular" className="text-base text-neutral-400" />
                </span>
              </Tooltip>
            </span>
          ) : (
            version
          ),
        isDisabled: version === 'latest',
      })) ?? []

  const versionKnown = options.find(({ value }) => value === imageTag)

  return isFetching ? (
    <div className="flex justify-center">
      <LoaderSpinner />
    </div>
  ) : options.length > 0 && (imageTag ? versionKnown : true) ? (
    <Controller
      name="image_tag"
      control={control}
      rules={{
        required: 'Please select a value.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          onChange={field.onChange}
          value={field.value}
          options={options}
          error={error?.message}
          label="Image tag"
          hint="Image tag shall be unique (no ‘main’, ‘dev’, ‘master’)"
          dataTestId="input-text-image-tag"
          isSearchable
          filterOption="startsWith"
          isCreatable
        />
      )}
    />
  ) : (
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
          error={error?.message}
          label="Image tag"
          hint={
            <>
              <span className="text-orange-500">
                No tag found. Please verify that the container registry and the image name is correct. You can still
                enter your image tag manually.
              </span>
              <br />
              Image tag shall be unique (no ‘main’, ‘dev’, ‘master’)
            </>
          }
        />
      )}
    />
  )
}

export function GeneralContainerSettings({ organization }: GeneralContainerSettingsProps) {
  const { control, watch } = useFormContext<{
    registry?: string
    image_name?: string
    image_tag?: string
  }>()
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
            onChange={(event) => {
              event.target.value = event.target.value.trim()
              field.onChange(event)
            }}
            value={field.value}
            label="Image name"
            error={error?.message}
          />
        )}
      />
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
