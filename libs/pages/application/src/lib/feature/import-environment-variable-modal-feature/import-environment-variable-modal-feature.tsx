import { FormProvider, useForm } from 'react-hook-form'
import ImportEnvironmentVariableModal from '../../ui/import-environment-variable-modal/import-environment-variable-modal'
import { useCallback, useEffect, useState } from 'react'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { jsonToForm } from './utils/file-to-form'
import { triggerToggleAll } from './utils/trigger-toggle-all'
import { changeScopeForAll } from './utils/change-scope-all'
import { handleSubmit } from './utils/handle-submit'
import { computeAvailableScope } from '../../utils/compute-available-environment-variable-scope'
import { useDropzone } from 'react-dropzone'

export interface ImportEnvironmentVariableModalFeatureProps {
  applicationId: string
  setOpen: (b: boolean) => void
}

export function ImportEnvironmentVariableModalFeature(props: ImportEnvironmentVariableModalFeatureProps) {
  const json = JSON.stringify({
    key1: 'value1',
    key2: 'value2',
    key3: 'value3',
  })
  const defaultValues = jsonToForm(json)
  const methods = useForm({ defaultValues, mode: 'onChange' })

  const [fileParsed, setFileParsed] = useState<{ [key: string]: string } | undefined>(undefined)
  const [keys, setKeys] = useState<string[]>([])

  const handleData = useCallback(
    async (data: string) => {
      setFileParsed(jsonToForm(data))
      const dataParsed = JSON.parse(data)
      setKeys(Object.keys(dataParsed))
    },
    [methods, fileParsed, setFileParsed, setKeys]
  )

  useEffect(() => {
    methods.reset(fileParsed)
  }, [fileParsed, methods])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = async () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        await handleData(binaryStr as string)
      }

      reader.readAsText(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <>
      {!fileParsed ? (
        <div {...getRootProps({ className: 'dropzone' })} className="flex h-[200px]">
          <input data-testid="drop-input" {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some env files here, or click to select files</p>
          )}
        </div>
      ) : (
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
          />
        </FormProvider>
      )}
    </>
  )
}

export default ImportEnvironmentVariableModalFeature
