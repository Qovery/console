import { FormProvider, useForm } from 'react-hook-form'
import ImportEnvironmentVariableModal from '../../ui/import-environment-variable-modal/import-environment-variable-modal'
import { useState } from 'react'

export interface ImportEnvironmentVariableModalFeatureProps {
  applicationId: string
}

export function ImportEnvironmentVariableModalFeature(props: ImportEnvironmentVariableModalFeatureProps) {
  const methods = useForm({ defaultValues: {}, mode: 'onChange' })
  const [fileParsed, setFileParsed] = useState<boolean>(false)

  return (
    <FormProvider {...methods}>
      <ImportEnvironmentVariableModal />
    </FormProvider>
  )
}

export default ImportEnvironmentVariableModalFeature
