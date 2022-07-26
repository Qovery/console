import { FormProvider, useForm } from 'react-hook-form'
import ImportEnvironmentVariableModal from '../../ui/import-environment-variable-modal/import-environment-variable-modal'
import { useState } from 'react'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { jsonToForm } from './utils/file-to-form'
import { triggerToggleAll } from './utils/trigger-toggle-all'
import { changeScopeForAll } from './utils/change-scope-all'
import { handleSubmit } from './utils/handle-submit'
import { computeAvailableScope } from '../../utils/compute-available-environment-variable-scope'

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

  // const [fileParsed, setFileParsed] = useState<boolean>(false)
  const [keys] = useState<string[]>(Object.keys(JSON.parse(json)))

  return (
    <FormProvider {...methods}>
      <ImportEnvironmentVariableModal
        toggleAll={false}
        triggerToggleAll={(b) => triggerToggleAll(b, methods.setValue, keys)}
        changeScopeForAll={(scope) => changeScopeForAll(scope as EnvironmentVariableScopeEnum, methods.setValue, keys)}
        keys={keys}
        setOpen={props.setOpen}
        loading={false}
        availableScopes={computeAvailableScope(undefined, true)}
        onSubmit={methods.handleSubmit(() => handleSubmit(methods.getValues()))}
      />
    </FormProvider>
  )
}

export default ImportEnvironmentVariableModalFeature
