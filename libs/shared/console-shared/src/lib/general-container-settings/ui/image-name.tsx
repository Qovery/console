import { useEffect, useState } from 'react'
import { type Control, Controller, useFormContext, useWatch } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useContainerImages, useContainerRegistries } from '@qovery/domains/organizations/feature'
import { type Value } from '@qovery/shared/interfaces'
import { InputSelect, InputText } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { type ContainerFormProps } from './general-container-settings'

const DEBOUNCE_TIME = 500

export function ImageName({
  control,
  organizationId,
  containerRegistryId,
  isSetting,
}: {
  control: Control<ContainerFormProps>
  organizationId: string
  containerRegistryId: string
  isSetting?: boolean
}) {
  const { setValue } = useFormContext()
  const { data: containerRegistries = [] } = useContainerRegistries({ organizationId })
  const watchImageName = useWatch({ control, name: 'image_name' }) || ''
  const [customOptions, setCustomOptions] = useState<Value[]>(
    isSetting
      ? [
          {
            value: watchImageName,
            label: watchImageName,
          },
        ]
      : []
  )
  const [searchParams, setSearchParams] = useState(watchImageName)
  const debouncedImageName = useDebounce(searchParams, DEBOUNCE_TIME)

  const {
    data: containerImages = [],
    refetch: refetchContainerImages,
    isFetching,
  } = useContainerImages({
    organizationId,
    containerRegistryId,
    search: debouncedImageName || watchImageName,
    enabled: (debouncedImageName || watchImageName).length > 2,
  })

  // XXX: Available only for this kind of registry: https://qovery.atlassian.net/browse/FRT-1307?focusedCommentId=13219
  const isSearchFieldAvailable = match(containerRegistries.find((c) => c.id === containerRegistryId))
    .with(
      { kind: 'ECR' },
      { kind: 'GCP_ARTIFACT_REGISTRY' },
      { kind: 'DOCKER_HUB' },
      { kind: 'GENERIC_CR' },
      () => true
    )
    .with({ kind: 'GITHUB_CR' }, (r) => r.config && Object.keys(r.config).length > 0)
    .otherwise(() => false)

  // Refetch when debounced value changes
  useEffect(() => {
    if (!isSearchFieldAvailable && debouncedImageName.length > 2) refetchContainerImages()
  }, [searchParams, refetchContainerImages])

  const options = [
    ...containerImages.map(({ image_name }) => ({
      value: image_name ?? '',
      label: image_name ?? '',
    })),
    ...customOptions,
  ]

  // Custom validation function for new options
  const isValidNewOption = (inputValue: string) => {
    // Check minimum length requirement
    if (inputValue.length < 3) {
      return false
    }

    const normalizedInput = inputValue.toLowerCase().trim()
    const valueExists = options.some((option) => option.value.toLowerCase() === normalizedInput)

    return !valueExists
  }

  return isSearchFieldAvailable ? (
    <Controller
      name="image_name"
      control={control}
      rules={{
        required: 'Please select a value.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          onInputChange={(value) => setSearchParams(value)}
          onChange={(value) => {
            // If the value doesn't exist in options, it's a new creation
            const existingOption = options.find((opt) => opt.value === value)
            if (!existingOption && value) {
              const newOption: Value = {
                value: String(value),
                label: String(value),
              }
              setCustomOptions((prev) => [...prev, newOption])
            }

            // Reset image tag when image name changes
            setValue('image_tag', containerImages.find((c) => c.image_name === value)?.versions?.[0] ?? '')
            field.onChange(value)
          }}
          value={field.value}
          options={options}
          error={error?.message}
          label="Image name"
          minInputLength={3}
          isLoading={isFetching || searchParams !== debouncedImageName}
          formatCreateLabel={(inputValue) => `Select "${inputValue}" - not found in registry`}
          isValidNewOption={isValidNewOption}
          filterOption="startsWith"
          isCreatable
          isSearchable
        />
      )}
    />
  ) : (
    <Controller
      name="image_name"
      control={control}
      rules={{
        required: 'Please type a value.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputText
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
  )
}

export default ImageName
