import { type CreditCard } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCreditCards, useDeleteCreditCard } from '@qovery/domains/organizations/feature'
import { AddCreditCardModalFeature, type CreditCardFormValues } from '@qovery/shared/console-shared'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationBilling from '../../ui/page-organization-billing/page-organization-billing'

export function PageOrganizationBillingFeature() {
  useDocumentTitle('Billing details - Organization settings')
  const { organizationId = '' } = useParams()
  const { openModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: creditCards = [], isLoading: isLoadingCreditCards } = useCreditCards({ organizationId })
  const { mutateAsync: deleteCreditCard } = useDeleteCreditCard()

  const methods = useForm<CreditCardFormValues>({
    mode: 'onChange',
  })

  const openNewCreditCardModal = () => {
    openModal({
      content: <AddCreditCardModalFeature organizationId={organizationId} />,
    })
  }

  const onDeleteCreditCard = (creditCard: CreditCard) => {
    openModalConfirmation({
      title: 'Delete credit card',
      name: creditCard.last_digit,
      isDelete: true,
      placeholder: 'Enter the last digits',
      action: async () => {
        await deleteCreditCard({ organizationId, creditCardId: creditCard.id })
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <PageOrganizationBilling
        creditCards={creditCards}
        openNewCreditCardModal={openNewCreditCardModal}
        onDeleteCard={onDeleteCreditCard}
        creditCardLoading={isLoadingCreditCards}
      />
    </FormProvider>
  )
}

export default PageOrganizationBillingFeature
