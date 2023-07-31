import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useFetchEnvironmentExportTerraform } from '@qovery/domains/environment'
import TerraformExportModal from '../ui/terraform-export-modal'

export interface TerraformExportModalFeatureProps {
  closeModal: () => void
  environmentId: string
}

export function TerraformExportModalFeature({ closeModal, environmentId }: TerraformExportModalFeatureProps) {
  const { projectId = '' } = useParams()

  const { mutate, isLoading, isSuccess } = useFetchEnvironmentExportTerraform(projectId, environmentId)

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    const exportSecrets = data['exportSecrets'] || false
    mutate({ exportSecrets: exportSecrets })
    if (isSuccess) closeModal()
  })

  return (
    <FormProvider {...methods}>
      <TerraformExportModal closeModal={closeModal} onSubmit={onSubmit} isLoading={isLoading} />
    </FormProvider>
  )
}

export default TerraformExportModalFeature
