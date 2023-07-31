import { Controller, useFormContext } from 'react-hook-form'
import { InputToggle, ModalCrud } from '@qovery/shared/ui'

export interface TerraformExportModalProps {
  closeModal: () => void
  onSubmit: () => void
  isLoading?: boolean
}

export function TerraformExportModal({ closeModal, onSubmit, isLoading }: TerraformExportModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title="Export as Terraform"
      description="Export full environment & resources into Terraform manifests."
      onClose={closeModal}
      onSubmit={onSubmit}
      submitLabel="Export"
      loading={isLoading}
    >
      <Controller
        name="exportSecrets"
        control={control}
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
  )
}

export default TerraformExportModal
