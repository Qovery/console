import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  getEnvironmentVariablesState,
  selectEnvironmentVariablesByApplicationId,
  selectSecretEnvironmentVariablesByApplicationId,
} from '@qovery/domains/environment-variable'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  LoadingStatus,
  SecretEnvironmentVariableEntity,
} from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { computeAvailableScope, parseEnvText } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import ImportEnvironmentVariableModal from '../../ui/import-environment-variable-modal/import-environment-variable-modal'
import { changeScopeForAll } from './utils/change-scope-all'
import { deleteEntry } from './utils/delete-entry'
import { parsedToForm } from './utils/file-to-form'
import { handleSubmit } from './utils/handle-submit'
import { onDrop } from './utils/on-drop'
import { triggerToggleAll } from './utils/trigger-toggle-all'

export interface ImportEnvironmentVariableModalFeatureProps {
  applicationId: string
  closeModal: () => void
  serviceType?: ServiceTypeEnum
}

export function ImportEnvironmentVariableModalFeature(props: ImportEnvironmentVariableModalFeatureProps) {
  const methods = useForm({ mode: 'all' })
  const [fileParsed, setFileParsed] = useState<{ [key: string]: string } | undefined>(undefined)
  const [keys, setKeys] = useState<string[]>([])
  const [overwriteEnabled, setOverwriteEnabled] = useState<boolean>(false)

  const { enableAlertClickOutside } = useModal()

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
  }, [environmentVariables, secretEnvironmentVariables])

  const handleData = useCallback(
    async (data: string) => {
      const parsed = parseEnvText(data)
      if (parsed) {
        const fileParsedd = parsedToForm(parsed)
        setFileParsed(fileParsedd)
        methods.reset(fileParsedd, { keepErrors: true, keepDirtyValues: true })
        setKeys(Object.keys(parsed))
      }
    },
    [setFileParsed, setKeys]
  )

  useEffect(() => {
    methods.trigger()
  }, [fileParsed, methods])

  useEffect(() => {
    if (fileParsed) enableAlertClickOutside(true)
  }, [fileParsed, enableAlertClickOutside])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, handleData),
  })

  return (
    <FormProvider {...methods}>
      <ImportEnvironmentVariableModal
        toggleAll={false}
        triggerToggleAll={(b) => triggerToggleAll(b, methods.setValue, keys)}
        changeScopeForAll={(scope) => changeScopeForAll(scope as APIVariableScopeEnum, methods.setValue, keys)}
        keys={keys}
        closeModal={props.closeModal}
        loading={loadingStatus === 'loading'}
        availableScopes={computeAvailableScope(undefined, false)}
        onSubmit={methods.handleSubmit(() =>
          handleSubmit(
            methods.getValues(),
            props.applicationId,
            keys,
            dispatch,
            props.closeModal,
            overwriteEnabled,
            props.serviceType
          )
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
        serviceType={props.serviceType}
      />
    </FormProvider>
  )
}

export default ImportEnvironmentVariableModalFeature
