import { type Control, Controller } from 'react-hook-form'
import { useContainerVersions } from '@qovery/domains/organizations/feature'
import { type Value } from '@qovery/shared/interfaces'
import { Icon, InputSelect, InputText, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { type ContainerFormProps } from './general-container-settings'

export function ImageTag({
  control,
  organizationId,
  containerRegistryId,
  imageName,
  imageTag,
}: {
  control: Control<ContainerFormProps>
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
          name="image_tag"
          onChange={field.onChange}
          value={field.value}
          error={error?.message}
          label="Image tag"
          hint={
            <>
              <span className="text-orange-500">
                Tag not found. Please verify that the container registry and the image name are correct. You can
                manually enter it.
                <br />
                Note: If you have more than 500 tags for this image, only the first 500 are displayed.
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

export default ImageTag
