import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { OrganizationEntity, Value } from '@qovery/shared/interfaces'
import { InputSelect, InputText, InputTextArea } from '@qovery/shared/ui'

export interface CreateGeneralContainerProps {
  organization?: OrganizationEntity
}

export function CreateGeneralContainer(props: CreateGeneralContainerProps) {
  const { control } = useFormContext<{
    registry?: string
    image_name?: string
    image_tag?: string
    image_entry_point?: string
    cmd_arguments?: string
  }>()
  const [availableRegistiesOptions, setAvailableRegistiesOptions] = useState<Value[]>([])

  useEffect(() => {
    if (props.organization?.containerRegistries?.items && props.organization.containerRegistries.items.length > 0) {
      setAvailableRegistiesOptions(
        props.organization.containerRegistries.items.map((registry) => ({
          value: registry.id,
          label: registry.name || '',
        }))
      )

      // setInterval(() => {
      //   trigger().then()
      //   getValues()
      // }, 100)
    }
  }, [props.organization])

  return (
    <div className="mb-6">
      <p className="mb-3 text-sm text-text-500">
        For Applications created from a Registry, fill the informations below
      </p>
      <Controller
        name="registry"
        control={control}
        rules={{
          required: 'Please select a registry.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-registry"
            className="mb-3"
            onChange={field.onChange}
            value={field.value}
            options={availableRegistiesOptions}
            label="Registry"
            error={error?.message}
          />
        )}
      />
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
      <Controller
        name="image_entry_point"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-text-image-entry-point"
            name="image_entry_point"
            className="mb-3"
            onChange={field.onChange}
            value={field.value}
            label="Image Entry Point"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="cmd_arguments"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
            dataTestId="input-textarea-cmd-arguments"
            name="cmd_arguments"
            onChange={field.onChange}
            value={field.value}
            label="CMD Arguments"
            error={error?.message}
          />
        )}
      />
      <p className="text-xs ml-4 mt-1 text-text-400">
        Expected format: ["rails", "-h", "0.0.0.0", "-p", "8080", "string"]
      </p>
    </div>
  )
}

export default CreateGeneralContainer
