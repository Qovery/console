import { ModalCrud } from '@qovery/shared/ui'

export interface TerraformExportModalProps {
  closeModal: () => void
  onSubmit: () => void
  isLoading?: boolean
}

export function TerraformExportModal({ closeModal, onSubmit, isLoading }: TerraformExportModalProps) {
  return (
    <ModalCrud
      title="Export as Terraform"
      description="Effortlessly export full environment & resources into Terraform manifests. You have an optional switch for secure secrets. "
      onClose={closeModal}
      onSubmit={onSubmit}
      submitLabel="Export"
      loading={isLoading}
    >
      <div></div>
    </ModalCrud>
  )
}

export default TerraformExportModal
