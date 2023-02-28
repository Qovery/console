import { ModalCrud } from '@qovery/shared/ui'
import CreditCardForm from '../../credit-card-form/ui/credit-card-form'

export interface AddCreditCardModalProps {
  closeModal: () => void
  onSubmit: () => void
  loading?: boolean
}

export function AddCreditCardModal(props: AddCreditCardModalProps) {
  return (
    <ModalCrud
      title="Add credit card"
      description="Card informations are secured by Stripe."
      onClose={props.closeModal}
      onSubmit={props.onSubmit}
      loading={props.loading}
    >
      <CreditCardForm />
    </ModalCrud>
  )
}

export default AddCreditCardModal
