import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputToggle, ModalCrud, useModal } from '@qovery/shared/ui'
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

  const onSubmit = methods.handleSubmit(async ({ exportSecrets }) => {
    try {
      await downloadTerraformConfiguration({ environmentId: environmentId, exportSecrets: exportSecrets })
      closeModal()
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Export as Terraform"
        description="Export full environment & resources into Terraform manifests (only for Admin)."
        submitLabel="Export"
        onClose={closeModal}
        onSubmit={onSubmit}
        loading={isLoading}
      >
        <Controller
          name="exportSecrets"
          control={methods.control}
          render={({ field }) => (
            <InputToggle
              value={field.value}
              onChange={field.onChange}
              title="Export secrets"
              description="An optional toggle for secure secrets."
              forceAlignTop
              small
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default TerraformExportModal
