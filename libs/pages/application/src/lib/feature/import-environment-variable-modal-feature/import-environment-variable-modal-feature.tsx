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
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  LoadingStatus,
  SecretEnvironmentVariableEntity,
} from '@console/shared/interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import {
  getEnvironmentVariablesState,
  selectEnvironmentVariablesByApplicationId,
  selectSecretEnvironmentVariablesByApplicationId,
} from '@console/domains/environment-variable'
import { deleteEntry } from './utils/delete-entry'

export interface ImportEnvironmentVariableModalFeatureProps {
  applicationId: string
  closeModal: () => void
}

export function ImportEnvironmentVariableModalFeature(props: ImportEnvironmentVariableModalFeatureProps) {
  const methods = useForm({ mode: 'all' })
  const [fileParsed, setFileParsed] = useState<{ [key: string]: string } | undefined>(undefined)
  const [keys, setKeys] = useState<string[]>([])
  const [overwriteEnabled, setOverwriteEnabled] = useState<boolean>(false)

  const dispatch = useDispatch<AppDispatch>()

  const environmentVariables: EnvironmentVariableEntity[] = useSelector<RootState, EnvironmentVariableEntity[]>(
    (state) => selectEnvironmentVariablesByApplicationId(state, props.applicationId)
  )
  const loadingStatus: LoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getEnvironmentVariablesState(state).loadingStatus
  )
  const secretEnvironmentVariables: SecretEnvironmentVariableEntity[] = useSelector<
    RootState,
    SecretEnvironmentVariableEntity[]
  >((state) => selectSecretEnvironmentVariablesByApplicationId(state, props.applicationId))

  const [existingEnvVars, setExistingEnvVars] = useState<EnvironmentVariableSecretOrPublic[]>([])

  useEffect(() => {
    setExistingEnvVars([...environmentVariables, ...secretEnvironmentVariables])
    console.log(JSON.stringify(existingEnvVars))
  }, [environmentVariables, secretEnvironmentVariables])

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
    methods.reset(fileParsed, { keepErrors: true, keepDirtyValues: true })
    methods.trigger()
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
        loading={loadingStatus === 'loading'}
        availableScopes={computeAvailableScope(undefined, false)}
        onSubmit={methods.handleSubmit(() =>
          handleSubmit(methods.getValues(), props.applicationId, keys, dispatch, props.setOpen, overwriteEnabled)
        )}
        showDropzone={!fileParsed}
        dropzoneGetInputProps={getInputProps}
        dropzoneGetRootProps={getRootProps}
        dropzoneIsDragActive={isDragActive}
        existingVars={existingEnvVars}
        deleteKey={(key) => {
          deleteEntry(key, setKeys, keys, methods.unregister)
        }}
        overwriteEnabled={overwriteEnabled}
        setOverwriteEnabled={setOverwriteEnabled}
      />
    </FormProvider>
  )
}

export default ImportEnvironmentVariableModalFeature
