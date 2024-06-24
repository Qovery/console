import { Controller, useFormContext } from 'react-hook-form'
import { InputText, InputTextArea } from '@qovery/shared/ui'

export interface EntrypointCmdInputsProps {
  entrypointRequired?: boolean
  cmdRequired?: boolean
  imageEntryPointFieldName?: string
  cmdArgumentsFieldName?: string
}

const isValidJsonArray = (input: string): boolean => {
  try {
    const parsed = JSON.parse(input)
    return Array.isArray(parsed)
  } catch {
    return false
  }
}

export const validateCmdArguments = (value?: string): string | boolean => {
  if (!value) return true

  const errorMessage = 'Please enter a valid command.'

  // Allow to keep JSON array format
  if (isValidJsonArray(value)) return true

  const validateArgument = (arg: string) => {
    // eslint-disable-next-line
    const invalidChars = /[|&;<>*?()\[\]{}$#\\`!~]/
    return !invalidChars.test(arg)
  }

  try {
    const args = value.split(/\s+/) // Split by any whitespace including multiple spaces

    for (const arg of args) {
      if (arg.trim() === '') {
        return errorMessage + ' Detected extra space.'
      }
      if (!validateArgument(arg)) {
        return errorMessage + ` Invalid argument: ${arg}`
      }
    }

    return true
  } catch (e) {
    return errorMessage
  }
}

export function EntrypointCmdInputs({
  entrypointRequired = false,
  cmdRequired = false,
  imageEntryPointFieldName = 'image_entry_point',
  cmdArgumentsFieldName = 'cmd_arguments',
}: EntrypointCmdInputsProps) {
  const { control, watch } = useFormContext()

  const watchCmdArguments = watch(cmdArgumentsFieldName)
  const watchEntryPoint = watch(imageEntryPointFieldName)
  const watchImageName = watch('image_name')

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
          required: cmdRequired && 'Please enter a command.',
          validate: validateCmdArguments,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
            dataTestId="input-textarea-cmd-arguments"
            name="cmd_arguments"
            onChange={(e) => {
              if (isValidJsonArray(e.currentTarget.value)) {
                const value = JSON.parse(e.currentTarget.value)
                field.onChange(value.join(' '))
              } else {
                field.onChange(e)
              }
            }}
            value={field.value}
            label="CMD Arguments"
            hint={
              <>
                Expected format: -h 0.0.0.0 -p 8080 string{' '}
                {!error?.message && (watchEntryPoint || watchCmdArguments) && (
                  <>
                    <br />
                    i.e: docker run {watchEntryPoint ? '--entrypoint ' + watchEntryPoint : ''} {watchImageName}{' '}
                    {watchCmdArguments}
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
