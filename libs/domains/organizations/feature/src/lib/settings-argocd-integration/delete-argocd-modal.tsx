import { ModalConfirmation } from '@qovery/shared/ui'

export interface DeleteArgoCdModalProps {
  onSubmit: () => void
}

const DELETE_CONFIRMATION_ACTION = 'delete'

export function DeleteArgoCdModal({ onSubmit }: DeleteArgoCdModalProps) {
  return (
    <ModalConfirmation
      title="Remove ArgoCD integration"
      description={`To confirm the deletion of the integration, please type "${DELETE_CONFIRMATION_ACTION}"`}
      callback={onSubmit}
      confirmationMethod="action"
      confirmationAction={DELETE_CONFIRMATION_ACTION}
      placeholder={`Enter "${DELETE_CONFIRMATION_ACTION}"`}
      warning="Related ArgoCD services will no longer be displayed in Qovery. Environments containing only these services will be removed."
    />
  )
}

export default DeleteArgoCdModal
