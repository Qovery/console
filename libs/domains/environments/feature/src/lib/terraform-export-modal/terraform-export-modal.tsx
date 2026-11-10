import { FormProvider, useForm } from 'react-hook-form'
import { ModalCrud, useModal } from '@qovery/shared/ui'
import useExportTerraform from '../hooks/use-export-terraform/use-export-terraform'

export interface TerraformExportModalProps {
  environmentId: string
}

export function TerraformExportModal({ environmentId }: TerraformExportModalProps) {
  const { closeModal } = useModal()
  const { mutateAsync: downloadTerraformConfiguration, isLoading } = useExportTerraform()

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async () => {
    try {
      await downloadTerraformConfiguration({ environmentId })
      closeModal()
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Export as Terraform"
        description="Export your environment and resources as Terraform manifests. Secret values will not be exposed."
        submitLabel="Export"
        onClose={closeModal}
        onSubmit={onSubmit}
        loading={isLoading}
        children={null}
      />
    </FormProvider>
  )
}

export default TerraformExportModal
