import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea } from '@qovery/shared/ui'

export interface EntrypointCmdInputsProps {
  className?: string
  entrypointRequired?: boolean
  cmdRequired?: boolean
  imageEntryPointFieldName?: string
  cmdArgumentsFieldName?: string
}

export function EntrypointCmdInputs(props: EntrypointCmdInputsProps) {
  const {
    className = 'mb-6',
    entrypointRequired = false,
    cmdRequired = false,
    imageEntryPointFieldName = 'image_entry_point',
    cmdArgumentsFieldName = 'cmd_arguments',
  } = props
  const { control } = useFormContext()

  return (
    <div className={className}>
      <Controller
        name={imageEntryPointFieldName}
        control={control}
        rules={{
          required: entrypointRequired && 'Please enter an entrypoint.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-text-image-entry-point"
            name="image_entry_point"
            className="mb-3"
            onChange={field.onChange}
            value={field.value}
            label="Image Entrypoint"
            error={error?.message}
          />
        )}
      />
      <Controller
        name={cmdArgumentsFieldName}
        control={control}
        rules={{
          required: cmdRequired && 'Please enter an command.',
        }}
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

export default EntrypointCmdInputs
