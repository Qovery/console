import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea } from '@qovery/shared/ui'

export interface EntrypointCmdInputsProps {
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
  entrypointRequired = false,
  cmdRequired = false,
  imageEntryPointFieldName = 'image_entry_point',
  cmdArgumentsFieldName = 'cmd_arguments',
}: EntrypointCmdInputsProps) {
  const { control, watch } = useFormContext()

  return (
    <>
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
            hint="Expected format: entrypoint.sh"
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
            hint={
              <>
                Expected format: ["-h", "0.0.0.0", "-p", "8080", "string"]
                {watch(imageEntryPointFieldName) && (
                  <>
                    <br />
                    i.e: docker run --entrypoint {watch(imageEntryPointFieldName)} {watch('image_name')}{' '}
                    {formattedCmdArguments(watch(cmdArgumentsFieldName))}
                  </>
                )}
              </>
            }
            error={error?.message}
          />
        )}
      />
    </>
  )
}

export default EntrypointCmdInputs
