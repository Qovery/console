import { FormProvider, useForm } from 'react-hook-form'
import ImportEnvironmentVariableModal from '../../ui/import-environment-variable-modal/import-environment-variable-modal'
import { useCallback, useEffect, useState } from 'react'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { parsedToForm } from './utils/file-to-form'
import { triggerToggleAll } from './utils/trigger-toggle-all'
import { changeScopeForAll } from './utils/change-scope-all'
import { handleSubmit } from './utils/handle-submit'
import { computeAvailableScope } from '../../utils/compute-available-environment-variable-scope'
import { useDropzone } from 'react-dropzone'
import { parseEnvText } from '@console/shared/utils'
import { onDrop } from './utils/on-drop'

export interface ImportEnvironmentVariableModalFeatureProps {
  applicationId: string
  setOpen: (b: boolean) => void
}

export function ImportEnvironmentVariableModalFeature(props: ImportEnvironmentVariableModalFeatureProps) {
  const methods = useForm({ defaultValues: {}, mode: 'onChange' })

  const [fileParsed, setFileParsed] = useState<{ [key: string]: string } | undefined>(undefined)
  const [keys, setKeys] = useState<string[]>([])

  const handleData = useCallback(
    async (data: string) => {
      const parsed = parseEnvText(data)
      if (parsed) {
        setFileParsed(parsedToForm(parsed))
        setKeys(Object.keys(parsed))
      }
    },
    [setFileParsed, setKeys]
  )

  useEffect(() => {
    methods.reset(fileParsed)
  }, [fileParsed, methods])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections, event) => onDrop(acceptedFiles, handleData),
  })

  return (
    <FormProvider {...methods}>
      <ImportEnvironmentVariableModal
        toggleAll={false}
        triggerToggleAll={(b) => triggerToggleAll(b, methods.setValue, keys)}
        changeScopeForAll={(scope) =>
          changeScopeForAll(scope as EnvironmentVariableScopeEnum, methods.setValue, keys, methods.getValues)
        }
        keys={keys}
        setOpen={props.setOpen}
        loading={false}
        availableScopes={computeAvailableScope(undefined, true)}
        onSubmit={methods.handleSubmit(() => handleSubmit(methods.getValues()))}
        showDropzone={!fileParsed}
        dropzoneGetInputProps={getInputProps}
        dropzoneGetRootProps={getRootProps}
        dropzoneIsDragActive={isDragActive}
      />
    </FormProvider>
  )
}

export default ImportEnvironmentVariableModalFeature
