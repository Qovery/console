import { Controller, useFormContext } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export interface EntrypointCmdInputsProps {
  className?: string
  entrypointRequired?: boolean
  cmdRequired?: boolean
  imageEntryPointFieldName?: string
  cmdArgumentsFieldName?: string
}

export const formattedCmdArguments = (stringArray?: string) => {
  if (!stringArray) {
    return null
  }

  stringArray = stringArray?.trim()

  if (stringArray.startsWith('[') && stringArray.endsWith(']')) {
    stringArray = stringArray.slice(1, -1)
    const arrayElements = stringArray.split(',').map((element) => element.trim().replace(/"/g, ' '))
    return arrayElements
  }

  return null
}

export function EntrypointCmdInputs({
  className,
  entrypointRequired = false,
  cmdRequired = false,
  imageEntryPointFieldName = 'image_entry_point',
  cmdArgumentsFieldName = 'cmd_arguments',
}: EntrypointCmdInputsProps) {
  const { control, watch } = useFormContext()

  return (
    <div className={twMerge('mb-6 flex flex-col gap-3', className)}>
      <div>
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
              onChange={field.onChange}
              value={field.value}
              label="Image Entrypoint"
              error={error?.message}
            />
          )}
        />
        <p className="text-xs ml-4 mt-1 text-neutral-350">Expected format: entrypoint.sh</p>
      </div>
      <div>
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
        <p className="text-xs ml-4 mt-1 text-neutral-350">Expected format: ["-h", "0.0.0.0", "-p", "8080", "string"]</p>
        <p className="text-xs mt-1 text-neutral-350">
          {watch(imageEntryPointFieldName) && (
            <span className="block mt-2">
              i.e: docker run --entrypoint {watch(imageEntryPointFieldName)} {watch('image_name')}{' '}
              {formattedCmdArguments(watch(cmdArgumentsFieldName))}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export default EntrypointCmdInputs
