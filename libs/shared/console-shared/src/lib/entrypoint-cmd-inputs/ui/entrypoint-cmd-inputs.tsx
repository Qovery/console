import { Controller, useFormContext } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { joinArgsWithQuotes, parseCmd } from '@qovery/shared/util-js'

export interface EntrypointCmdInputsProps {
  entrypointRequired?: boolean
  cmdRequired?: boolean
  imageEntryPointFieldName?: string
  cmdArgumentsFieldName?: string
}

export const displayParsedCmd = (cmd: string) => {
  const parsedArgs = parseCmd(cmd)
  return joinArgsWithQuotes(parsedArgs)
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
  const watchImageTag = watch('image_tag')

  return (
    <div className="space-y-2">
      <Controller
        name={imageEntryPointFieldName}
        control={control}
        rules={{
          required: entrypointRequired && 'Please enter an entrypoint.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-text-image-entry-point"
            name={field.name}
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
        }}
        render={({ field }) => (
          <InputText
            dataTestId="input-textarea-cmd-arguments"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="CMD Arguments"
            hint={`Expected format: arg1 arg2 "complex arg3"`}
          />
        )}
      />
      {(watchEntryPoint || watchCmdArguments) && (
        <div className="flex flex-col rounded-md border border-neutral bg-surface-neutral-subtle px-3 py-2">
          <span className="select-none text-xs text-neutral-subtle">Docker run format:</span>
          <span className="break-words text-sm text-neutral-subtle">
            docker run {watchEntryPoint ? '--entrypoint ' + watchEntryPoint : ''}
            {watchImageName ? ` ${watchImageName}${watchImageTag ? `:${watchImageTag}` : ''}` : ''}{' '}
            {displayParsedCmd(watchCmdArguments ?? '')}
          </span>
        </div>
      )}
    </div>
  )
}

export default EntrypointCmdInputs
