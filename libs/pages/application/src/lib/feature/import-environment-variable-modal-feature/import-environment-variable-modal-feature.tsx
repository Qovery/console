import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { useImportVariables, useVariables } from '@qovery/domains/variables/feature'
import { useModal } from '@qovery/shared/ui'
import { computeAvailableScope, parseEnvText } from '@qovery/shared/util-js'
import ImportEnvironmentVariableModal from '../../ui/import-environment-variable-modal/import-environment-variable-modal'
import { changeScopeForAll } from './utils/change-scope-all'
import { deleteEntry } from './utils/delete-entry'
import { parsedToForm } from './utils/file-to-form'
import { formatData } from './utils/handle-submit'
import { onDrop } from './utils/on-drop'
import { triggerToggleAll } from './utils/trigger-toggle-all'

export interface ImportEnvironmentVariableModalFeatureProps {
  environmentId: string
  applicationId: string
  closeModal: () => void
  serviceType?: ServiceType
}

export function ImportEnvironmentVariableModalFeature(props: ImportEnvironmentVariableModalFeatureProps) {
  const methods = useForm({ mode: 'all' })
  const [fileParsed, setFileParsed] = useState<{ [key: string]: string } | undefined>(undefined)
  const [keys, setKeys] = useState<string[]>([])
  const [overwriteEnabled, setOverwriteEnabled] = useState<boolean>(false)

  const { enableAlertClickOutside } = useModal()

  const { data: service } = useService({
    environmentId: props.environmentId,
    serviceId: props.applicationId,
  })

  const scope = match(service?.serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .otherwise(() => undefined)

  const { data: existingEnvVars = [], isLoading } = useVariables({
    parentId: props.applicationId,
    scope,
  })

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

  const { mutateAsync: importVariables, isLoading: isImportVariablesLoading } = useImportVariables()

  return (
    <FormProvider {...methods}>
      <ImportEnvironmentVariableModal
        toggleAll={false}
        triggerToggleAll={(b) => triggerToggleAll(b, methods.setValue, keys)}
        changeScopeForAll={(scope) => changeScopeForAll(scope as APIVariableScopeEnum, methods.setValue, keys)}
        keys={keys}
        closeModal={props.closeModal}
        loading={isLoading || isImportVariablesLoading}
        availableScopes={computeAvailableScope(undefined, false)}
        onSubmit={methods.handleSubmit(async () => {
          if (!scope) {
            return
          }
          const vars = formatData(methods.getValues(), keys)
          await importVariables({
            serviceType: scope,
            serviceId: props.applicationId,
            variableImportRequest: {
              overwrite: overwriteEnabled,
              vars,
            },
          })
          props.closeModal()
        })}
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
