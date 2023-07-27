import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useFetchEnvironmentExportTerraform } from '@qovery/domains/environment'
import TerraformExportModal from '../ui/terraform-export-modal'

export interface TerraformExportModalFeatureProps {
  closeModal: () => void
}

export function TerraformExportModalFeature({ closeModal }: TerraformExportModalFeatureProps) {
  const { projectId = '', environmentId = '' } = useParams()

  const { mutate } = useFetchEnvironmentExportTerraform(projectId, environmentId)

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = () => {
    console.log('onSubmit')
    mutate()
  }

  return (
    <FormProvider {...methods}>
      <TerraformExportModal closeModal={closeModal} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default TerraformExportModalFeature
